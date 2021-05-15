import _ from 'lodash'
import Duet from 'role/creep/military/Duet'
import HitCalculator from 'room/military/HitCalculator'
import { offsetsByDirection, isWalkable } from 'utils/path'
import Memoized from 'utils/Memoized'

const directions: DirectionConstant[] = [1, 2, 3, 4, 5, 6, 7, 8]
export default class DuetHandler {
  private room: Room
  private duet?: Duet
  private target: Memoized<Structure>

  constructor(room: Room) {
    this.room = room
    this.target = new Memoized()
    this.recover()
  }

  handle() {
    const duet = this.findOrCreateDuet()
    if (!duet) return
    duet.heal()
    const safe = duet.safe
    if (safe && Game.cpu.bucket < 100) return
    if (!duet.whole || !duet.valid) return this.safeDestroyDuet(duet)
    if (!duet.connected) return duet.connect()
    const room = duet.room
    const pos = duet.pos
    if (!safe || !duet.healed) {
      console.log('unsafe')
      if (duet.keep?.room.name !== duet.protect?.room.name || duet.atBorder) {
        console.log('tragical')
        return duet.moveTo({ pos: this.room.sources.colonyPosition })
      }
      const calc = new HitCalculator(room)
      calc.fetch(false)
      const dealers = room.find(FIND_HOSTILE_CREEPS)
      const saferDir = _.min(directions, (d) => {
        const x = pos.x + offsetsByDirection[d][0]
        const y = pos.y + offsetsByDirection[d][1]
        if (!isWalkable(room, x, y)) return Infinity
        const newPos = new RoomPosition(x, y, room.name)
        return calc.getDamage(newPos, dealers)
      })
      duet.move(saferDir)
    } else if (pos.roomName !== this.targetRoom) {
      console.log('unarrived')
      if (!this.targetRoom) return this.safeDestroyDuet(duet)
      duet.arrive(this.targetRoom)
    } else {
      console.log('attacking')
      let target = this.target.object
      if (!target) {
        target =
          pos.findClosestByPath(FIND_STRUCTURES, {
            maxRooms: 1,
            filter: (s) =>
              s.structureType !== STRUCTURE_WALL &&
              s.structureType !== STRUCTURE_RAMPART,
          }) ||
          pos.findClosestByPath(FIND_STRUCTURES, {
            maxRooms: 1,
            filter: (s) =>
              s.structureType === STRUCTURE_WALL ||
              s.structureType === STRUCTURE_RAMPART,
          })
        if (!target) return this.safeDestroyDuet(duet)
        this.target = new Memoized(target)
      }
      if (!pos.isNearTo(target)) duet.moveTo(target)
      return duet.attack(target)
    }
  }

  get keeperPresent() {
    return !!this.duet?.keep
  }

  get protectorPresent() {
    return !!this.duet?.protect
  }

  private recover() {
    const creeps = this.room.memory[RoomMemoryKeys.duet]
    if (!creeps) return
    const keeper = Game.creeps[creeps[0]]
    const protector = Game.creeps[creeps[1]]
    if (keeper && protector) this.duet = new Duet(keeper, protector)
    else delete this.room.memory[RoomMemoryKeys.duet]
  }

  private safeDestroyDuet(duet: Duet) {
    if (duet.safe) {
      duet.destroy()
      delete this.duet
    } else {
      duet.moveTo({ pos: this.room.sources.colonyPosition })
    }
  }

  private findOrCreateDuet() {
    if (this.duet) return this.duet
    const keeper = this.room
      .find(FIND_MY_CREEPS)
      .find((c) => c.memory.role === Role.DESTROYER)
    if (!keeper) return
    const protector = keeper.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: (c) => c.memory.role === Role.TOWER_EKHAUSTER,
    })
    if (!protector) return
    keeper.memory.role = Role.DUAL
    protector.memory.role = Role.DUAL
    this.room.memory[RoomMemoryKeys.duet] = [keeper.name, protector.name]
    return (this.duet = new Duet(keeper, protector))
  }

  private get targetRoom() {
    return this.room.memory[RoomMemoryKeys.ekhaust]
  }
}
