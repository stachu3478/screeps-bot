import RoomPosition from './RoomPosition'
import { RoomVisual, RoomTerrain } from '../mock'

export default class RoomMock {
  public controller?: StructureController
  public energyAvailable: number
  public energyCapacityAvailable: number
  public memory: RoomMemory
  public name: string
  public storage?: StructureStorage
  public terminal?: StructureTerminal
  public visual: RoomVisual
  public prototype: any
  public mode: any

  constructor(name: string) {
    this.energyAvailable = 0;
    this.energyCapacityAvailable = 0;
    this.memory = {} as RoomMemory;
    this.name = name
    this.visual = new RoomVisual(name)
  }

  static serializePath() {
    return ''
  }

  static deserializePath() {
    return []
  }

  createConstructionSite(x: number, y: number, type: StructureConstant) {
    return this.getPositionAt(x, y).createConstructionSite(type)
  }

  createFlag(x: number | RoomPosition | _HasRoomPosition, y: number): ScreepsReturnCode {
    return this.getPositionAt(x as number, y).createFlag()
  }

  find() {
    return []
  }

  findExitTo() {
    return ERR_NO_PATH
  }

  findPath() {
    return []
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

  lookForAt(type: LookConstant, x: number, y: number) {
    return this.getPositionAt(x, y).lookFor(type)
  }

  lookForAtArea() {
    return {}
  }
};
