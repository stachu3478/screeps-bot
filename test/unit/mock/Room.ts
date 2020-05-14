import RoomPosition from './RoomPosition'
import { RoomVisual, RoomTerrain } from '../mock'

export default class Room {
  public controller: undefined
  public energyAvailable: number
  public energyCapacityAvailable: number
  public memory: RoomMemory
  public name: string
  public storage: undefined
  public terminal: undefined
  public visual: RoomVisual

  constructor() {
    this.energyAvailable = 0;
    this.energyCapacityAvailable = 0;
    this.memory = {} as RoomMemory;
    this.name = 'test'
    this.visual = new RoomVisual()
  }

  static serializePath() {
    return ''
  }

  static deserializePath() {
    return []
  }

  createConstructionSite() {
    return OK
  }

  createFlag() {
    return OK
  }

  find() {
    return []
  }

  findExitTo() {
    return ERR_NO_PATH
  }

  findPath() {
    return 0
  }

  getEventLog() {
    return []
  }

  getPositionAt(x: number, y: number) {
    return new RoomPosition(x, y, this.name)
  }

  getTerrain() {
    return new RoomTerrain()
  }

  lookAt(x: number, y: number) {
    return this.getPositionAt(x, y).look()
  }

  lookAtArea() {
    return {} // TODO mock better
  }

  lookForAt() {
    return []
  }

  lookForAtArea() {
    return {}
  }
}
