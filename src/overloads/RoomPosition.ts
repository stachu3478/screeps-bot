RoomPosition.prototype.rangeXY = function (x: number, y: number) {
  return Math.max(Math.abs(this.x - x), Math.abs(this.y - y))
}

RoomPosition.prototype.range = function (pos: RoomPosition) {
  return this.rangeXY(pos.x, pos.y)
}

RoomPosition.prototype.rangeTo = function (obj: _HasRoomPosition) {
  return this.range(obj.pos)
}

RoomPosition.prototype.building = function <T extends StructureConstant>(
  type: StructureConstant,
) {
  return this.lookFor(LOOK_STRUCTURES).find((s) => s.structureType === type) as
    | ConcreteStructure<T>
    | undefined
}

RoomPosition.prototype.isBorder = function () {
  return this.x === 49 || this.y === 49 || this.x === 0 || this.y === 0
}

RoomPosition.prototype.disbordered = function () {
  let x = this.x
  let y = this.y
  if (x === 49) x = 48
  if (y === 49) y = 48
  if (x === 0) x = 1
  if (y === 0) y = 1
  return new RoomPosition(x, y, this.roomName)
}
