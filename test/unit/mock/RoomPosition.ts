export default class RoomPosition {
  public x: number
  public y: number
  public roomName: string
  public prototype: any

  constructor(x: number, y: number, name: string) {
    this.x = x
    this.y = y
    this.roomName = name
  }

  createConstructionSite(type: StructureConstant): ScreepsReturnCode {
    return OK
  }

  createFlag(): ScreepsReturnCode {
    return OK
  }

  findClosestByPath() {
    return null
  }

  findClosestByRange() {
    return null
  }

  findInRange() {
    return []
  }

  findPathTo(that: RoomPosition) {
    return [
      {
        x: that.x,
        y: that.y,
        direction: BOTTOM_RIGHT,
        dx: 1,
        dy: -1,
      },
    ]
  }

  getDirectionTo() {
    return TOP
  }

  getRangeTo(x: number | _HasRoomPosition, y: number): number {
    if (typeof x === 'number')
      return Math.max(Math.abs(this.x - x), Math.abs(this.y - y))
    return this.getRangeTo(x.pos.x, x.pos.y)
  }

  inRangeTo(x: number, y: number, r: number) {
    return this.getRangeTo(x, y) <= r
  }

  isEqualTo(x: number, y: number) {
    return this.inRangeTo(x, y, 0)
  }

  isNearTo(x: number, y: number) {
    return this.inRangeTo(x, y, 1)
  }

  look() {
    return [
      {
        type: 'terrain',
        terrain: 'plain',
      },
    ]
  }

  lookFor(type: LookConstant) {
    return []
  }
}
