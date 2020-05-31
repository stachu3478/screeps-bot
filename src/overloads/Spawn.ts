import { getXYRoad } from "utils/selectFromPos";

const allDirections: DirectionConstant[] = [1, 2, 3, 4, 5, 6, 7, 8]
StructureSpawn.prototype.getDirections = function () {
  const room = this.room
  const sx = this.pos.x
  const sy = this.pos.y
  const directions: DirectionConstant[] = []
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++) {
      const road = getXYRoad(room, sx + x, sy + y)
      if (road) directions.push(this.pos.getDirectionTo(sx + x, sy + y))
    }
  if (directions.length > 0) return directions
  return allDirections
}
