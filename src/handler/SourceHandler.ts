import plan from 'planner/core'
import { Miner } from 'role/creep/miner'

export default class SourceHandler {
  private room: Room
  private memory: SourceMap
  private colony: string
  private roomPositions?: RoomPosition[]

  constructor(room: Room) {
    this.room = room
    if (!room.memory.colonySources) plan(room)
    this.memory = room.memory.colonySources || {}
    this.colony = room.memory.colonySourceId || ''
  }

  assign(creepName: string, sourceId: string = '') {
    this.memory[sourceId] = this.memory[sourceId].slice(0, 2) + creepName
  }

  getPosition(sourceId?: string) {
    return this.room.positionFromChar(this.memory[sourceId || ''] || '')
  }

  getDistance(sourceId: string) {
    return this.memory[sourceId].charCodeAt(1)
  }

  get free() {
    for (const id in this.memory) {
      const name = this.memory[id].slice(2)
      const creep = Game.creeps[name] as Miner
      if (!creep || creep.memory._harvest !== id || creep.isRetired) {
        return id
      }
    }
    return
  }

  get positions() {
    return (
      this.roomPositions ||
      (this.roomPositions = Object.values(this.memory).map((p) =>
        this.room.positionFromChar(p),
      ))
    )
  }

  get colonyPosition() {
    return this.getPosition(this.colony)
  }
}
