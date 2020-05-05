import { roomPos } from "planner/pos";

export default class SourceWrapper {
  private wrapped: string
  private roomName: string

  constructor(v: string, roomName: string) {
    this.wrapped = v
    this.roomName = roomName
  }

  getMiningPosition() {
    return roomPos(this.wrapped.charAt(0), this.roomName)
  }

  getDistanceFromSpawn() {
    return this.wrapped.charCodeAt(1)
  }

  getMinerName() {
    return this.wrapped.slice(2)
  }
}
