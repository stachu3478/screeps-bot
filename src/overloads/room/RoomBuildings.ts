import _, { Dictionary } from 'lodash'

export default class RoomBuildings {
  private room: Room
  private fetchTime: number = 0
  private structures: Dictionary<Structure[] | undefined> = {}

  constructor(room: Room) {
    this.room = room
  }

  get<T>(...types: (T & StructureConstant)[]) {
    let structures: ConcreteStructure<T & StructureConstant>[] = []
    const fetched = this.fetched
    types.forEach((type) => {
      const structuresByType = fetched[type]
      if (structuresByType) {
        structures = structures.concat(
          structuresByType as ConcreteStructure<T & StructureConstant>[],
        )
      }
    })
    return structures
  }

  findOne<T>(type: T & StructureConstant) {
    const stack = this.fetched[type]
    return stack && (stack[0] as ConcreteStructure<T & StructureConstant>)
  }

  find<T>(type: T & StructureConstant) {
    const stack = this.fetched[type]
    return (stack || []) as ConcreteStructure<T & StructureConstant>[]
  }

  get factory() {
    return this.findOne(STRUCTURE_FACTORY)
  }

  get labs() {
    return this.find(STRUCTURE_LAB)
  }

  get extractor() {
    return this.findOne(STRUCTURE_EXTRACTOR)
  }

  get powerSpawn() {
    return this.findOne(STRUCTURE_POWER_SPAWN)
  }

  get spawnsWithExtensions() {
    return this.get(STRUCTURE_SPAWN, STRUCTURE_EXTENSION)
  }

  get observer() {
    return this.findOne(STRUCTURE_OBSERVER)
  }

  get towers() {
    return this.find(STRUCTURE_TOWER)
  }

  get spawns() {
    return this.find(STRUCTURE_SPAWN)
  }

  get extensions() {
    return this.find(STRUCTURE_EXTENSION)
  }

  get nuker() {
    return this.findOne(STRUCTURE_NUKER)
  }

  get links() {
    return this.find(STRUCTURE_LINK)
  }

  get invaderCore() {
    return this.findOne(STRUCTURE_INVADER_CORE)
  }

  get roads() {
    return this.find(STRUCTURE_ROAD)
  }

  get containers() {
    return this.find(STRUCTURE_CONTAINER)
  }

  private get fetched() {
    if (this.fetchTime === Game.time) return this.structures
    this.fetchTime = Game.time
    this.structures = {}
    const structures = this.room.find(FIND_STRUCTURES)
    structures.forEach((s) => {
      const type = s.structureType
      const stack = this.structures[type] || (this.structures[type] = [])
      stack.push(s)
    })
    return this.structures
  }
}
