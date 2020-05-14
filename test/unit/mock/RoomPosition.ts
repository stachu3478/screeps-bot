export default class RoomPosition {
  public x: number
  public y: number
  public roomName: string

  constructor(x: number, y: number, name: string) {
    this.x = x;
    this.y = y;
    this.roomName = name;
  }

  createConstructionSite() {
    return OK
  }

  createFlag() {
    return OK
  }

  findClosestByPath() {
    return null
  }

  findClosestBRange() {
    return null
  }

  findInRange() {
    return []
  }

  findPathTo() {
    return []
  }

  getDirectionTo() {
    return TOP
  }

  getRangeTo(x: number, y: number) {
    return Math.max(Math.abs(this.x - x), Math.abs(this.y - y))
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
    return [{
      type: 'terrain',
      terrain: 'plain'
    }]
  }

  lookFor() {
    return []
  }
}
