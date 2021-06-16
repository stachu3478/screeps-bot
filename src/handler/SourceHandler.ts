import RoomStructuresPlanner from 'planner/RoomStructuresPlanner'
import ProfilerPlus from 'utils/ProfilerPlus'

export default class SourceHandler {
  private room: Room
  private memory: string[]
  private colony: number
  private roomPositions?: RoomPosition[]

  constructor(room: Room) {
    this.room = room
    if (!room.memory[RoomMemoryKeys.sourceInfo]) {
      new RoomStructuresPlanner(room, room.controller!.pos).run()
    }
    this.memory = room.memory[RoomMemoryKeys.sourceInfo] || []
    this.colony = room.memory[RoomMemoryKeys.colonySourceIndex] || 0
  }

  assign(creepName: string, sourceIndex: number = this.free) {
    if (sourceIndex !== -1) {
      this.memory[sourceIndex] =
        this.memory[sourceIndex].slice(0, 2) + creepName
    }
    return sourceIndex
  }

  getPosition(sourceIndex: number) {
    return this.room.positionFromChar(this.memory[sourceIndex])
  }

  getDistance(sourceIndex: number) {
    return this.memory[sourceIndex].charCodeAt(1)
  }

  getOrAssign(creep: Creep): number {
    if (creep.isRetired) {
      return this.positions.indexOf(
        creep.pos.findClosestByPath(this.positions) as any,
      )
    }
    const index = this.memory.findIndex((info) => {
      const name = info.slice(2)
      return creep.name === name
    })
    if (index === -1) return this.assign(creep.name)
    return index
  }

  private isFree(info: string) {
    const name = info.slice(2)
    const creep = Game.creeps[name]
    if (!creep || creep.motherRoom.name !== this.room.name) return true
    return creep.isRetired
  }

  get free() {
    if (this.isFree(this.memory[this.colony])) {
      return this.colony
    }
    return this.memory.findIndex((info) => this.isFree(info))
  }

  get positions() {
    return (
      this.roomPositions ||
      (this.roomPositions = this.memory.map((p) =>
        this.room.positionFromChar(p),
      ))
    )
  }

  get colonyPosition() {
    return this.getPosition(this.colony)
  }
}

ProfilerPlus.instance.overrideObject(SourceHandler, 'SourceHandler')
