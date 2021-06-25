import { roomCache } from 'overloads/cache'
import { findSourceKeepers } from 'utils/find'

export default function roomCallback(
  roomName: string,
  costMatrix = new PathFinder.CostMatrix(),
) {
  const room = Game.rooms[roomName]
  if (room) {
    let sourceKeepers: _HasRoomPosition[] = findSourceKeepers(room)
    if (!sourceKeepers.length) {
      sourceKeepers = room.buildings.find(STRUCTURE_KEEPER_LAIR)
    }
    room.cache.sourceKeeperPositions = sourceKeepers.map((c) => c.pos)
    room.cache.structurePositions = room
      .find(FIND_STRUCTURES)
      .filter((s) => !s.isWalkable)
      .map((s) => s.pos)
  }
  const cache = roomCache({ name: roomName } as Room)
  if (!cache) {
    return costMatrix
  }
  cache.sourceKeeperPositions.forEach(({ x, y }) => {
    for (let ox = -3; ox <= 3; ox++)
      for (let oy = -3; oy <= 3; oy++) costMatrix.set(x + ox, y + oy, 25)
  })
  cache.structurePositions.forEach(({ x, y }) => {
    costMatrix.set(x, y, 255)
  })
  return costMatrix
}
