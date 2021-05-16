import _, { Dictionary } from 'lodash'

export default class RoomBuildings {
  private room: Room
  private fetchTime: number = 0
  private structures: Dictionary<Structure[] | undefined> = {}

  constructor(room: Room) {
    this.room = room
  }

  get factory() {
    const stack = this.fetched[STRUCTURE_FACTORY]
    return stack && (stack[0] as StructureFactory)
  }

  get labs() {
    const stack = this.fetched[STRUCTURE_LAB]
    return (stack || []) as StructureLab[]
  }

  get extractor() {
    const stack = this.fetched[STRUCTURE_EXTRACTOR]
    return stack && (stack[0] as StructureExtractor)
  }

  get powerSpawn() {
    const stack = this.fetched[STRUCTURE_POWER_SPAWN]
    return stack && (stack[0] as StructurePowerSpawn)
  }

  get spawnsWithExtensions() {
    const spawns: (StructureSpawn | StructureExtension)[] = this.spawns
    return spawns.concat(this.extensions)
  }

  get observer() {
    const stack = this.fetched[STRUCTURE_OBSERVER]
    return stack && (stack[0] as StructureObserver)
  }

  get towers() {
    const stack = this.fetched[STRUCTURE_TOWER]
    return (stack || []) as StructureTower[]
  }

  get spawns() {
    const stack = this.fetched[STRUCTURE_SPAWN]
    return (stack || []) as StructureSpawn[]
  }

  get extensions() {
    const stack = this.fetched[STRUCTURE_EXTENSION]
    return (stack || []) as StructureExtension[]
  }

  get nuker() {
    const stack = this.fetched[STRUCTURE_NUKER]
    return stack && (stack[0] as StructureNuker)
  }

  get links() {
    const stack = this.fetched[STRUCTURE_LINK]
    return (stack || []) as StructureLink[]
  }

  private get fetched() {
    if (this.fetchTime === Game.time) return this.structures
    this.fetchTime = Game.time
    this.structures = _.mapValues(CONTROLLER_STRUCTURES, (_) => [])
    const structures = this.room.find(FIND_STRUCTURES)
    structures.forEach((s) => {
      const type = s.structureType
      const stack = this.structures[type]
      if (!stack) return
      stack.push(s)
    })
    return this.structures
  }
}
