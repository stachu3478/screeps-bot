import { getMaximumWorkPartsForSource } from 'planner/opts'
import harvest from 'routine/work/harvest'
import sanitizeBody from 'utils/sanitizeBody'
import { uniqName } from 'spawn/name'

class RemoteCreep {
  private memory?: RemoteCreepMemory
  private name: string = ''

  work() {}

  setName(name: string) {
    this.name = name
    this.createMemory()
  }

  setMemory(memory: RemoteCreepMemory) {
    this.memory = memory
    this.name = memory.n
  }

  isDead() {
    return !this.creep
  }

  protected get creep() {
    return Game.creeps[this.name]
  }

  private createMemory() {
    this.memory = {
      n: this.name,
      s: State.IDLE,
    }
  }
}

class RemoteHarvester extends RemoteCreep {}

class RemoteHauler extends RemoteCreep {}

class Remote {
  private spawn: StructureSpawn
  private distance: number = 0
  private carryNeeded: number = 0
  private workNeeded: number = 0
  private harvestEfficiency: number = 0
  private _harvester?: RemoteHarvester
  private haulers: RemoteHauler[]
  private memory?: RemoteMemory
  private sourcePos?: RoomPosition
  constructor(spawn: StructureSpawn) {
    this.spawn = spawn
    this.haulers = []
  }

  createHarvester() {
    const energy = this.spawn.room.energyAvailable
    const carryPackCost = BODYPART_COST[CARRY] * 2 + BODYPART_COST[MOVE]
    const carryPacks = Math.min(50, Math.floor(energy / carryPackCost))
    const bodyParts = new Array(carryPacks * 3)
      .fill(1)
      .map((_, i) => (i % 3 ? CARRY : MOVE))
    const name = uniqName('R')
    const result = this.spawn.spawnCreep(sanitizeBody(bodyParts), name)
    if (result == 0) {
      this._harvester = new RemoteHarvester()
      this._harvester.setName(name)
    }
  }

  get harvester(): RemoteHarvester | undefined {
    return this._harvester
  }

  setMemory(memory: RemoteMemory) {
    this.memory = memory
    this.sourcePos = new RoomPosition(memory.s.x, memory.s.y, memory.s.n)
    this._harvester = new RemoteHarvester()
    this._harvester.setMemory(memory.h)
    this.applySource(this.sourcePos)
  }

  setSource(sourcePos: RoomPosition, memories: RemoteMemory[]) {
    this.sourcePos = sourcePos
    this.applySource(sourcePos)
    this.createMemory(memories)
  }

  private createMemory(memories: RemoteMemory[]) {
    if (!this.sourcePos) throw new Error('Missing source')
    this.memory = {
      c: [],
      h: { n: '', s: 0 },
      s: {
        x: this.sourcePos.x,
        y: this.sourcePos.y,
        n: this.sourcePos.roomName,
      },
    }
    memories.push(this.memory)
  }

  private applySource(sourcePos: RoomPosition) {
    this.distance = this.spawn.pos.findPathTo(sourcePos).length
    this.workNeeded = Math.ceil(
      SOURCE_ENERGY_NEUTRAL_CAPACITY / ENERGY_REGEN_TIME / HARVEST_POWER,
    )
    this.harvestEfficiency = this.workNeeded * HARVEST_POWER
    this.carryNeeded = (this.harvestEfficiency * this.distance) / CARRY_CAPACITY
  }
}

export default class RemoteHandler {
  private memories: RemoteMemory[]
  private spawn: StructureSpawn
  private remotes: Remote[]

  constructor(spawn: StructureSpawn) {
    this.memories = spawn.room.memory.r || (spawn.room.memory.r = [])
    this.spawn = spawn
    this.remotes = []
  }

  processRemotes() {
    this.remotes.forEach((remote) => {
      const harvester = remote.harvester
      if (harvester && !harvester.isDead()) {
        harvester.work()
      } else {
        remote.createHarvester()
      }
    })
  }

  addRemote(sourcePos: RoomPosition) {
    const remote = new Remote(this.spawn)
    remote.setSource(sourcePos, this.memories)
    this.remotes.push(remote)
  }
}
