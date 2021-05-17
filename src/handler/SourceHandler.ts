import plan from 'planner/core'
import { Miner } from 'role/creep/miner'

export default class SourceHandler {
  private room: Room
  private memory: string[]
  private colony: number
  private roomPositions?: RoomPosition[]

  constructor(room: Room) {
    this.room = room
    if (!room.memory[RoomMemoryKeys.sourceInfo]) plan(room)
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
    const index = this.memory.findIndex((info) => {
      const name = info.slice(2)
      return creep.name === name
    })
    if (index === -1) return this.assign(creep.name)
    return index
  }

  get free() {
    return this.memory.findIndex((info, i) => {
      const name = info.slice(2)
      const creep = Game.creeps[name] as Miner
      if (!creep) return true
      return creep.isRetired
    })
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
