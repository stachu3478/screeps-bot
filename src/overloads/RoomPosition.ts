RoomPosition.prototype.rangeXY = function (x: number, y: number) {
  return Math.max(Math.abs(this.x - x), Math.abs(this.y - y))
}

RoomPosition.prototype.range = function (pos: RoomPosition) {
  return this.rangeXY(pos.x, pos.y)
}

RoomPosition.prototype.rangeTo = function (obj: _HasRoomPosition) {
  return this.range(obj.pos)
}

RoomPosition.prototype.building = function (type: StructureConstant) {
  return this.lookFor(LOOK_STRUCTURES).find((s) => s.structureType === type)
}
