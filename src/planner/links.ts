import pos, { roomPos } from './pos'
import whirl from 'utils/whirl'

// prosper for a link
export default function planLink(
  room: Room,
  sourcePosition: string | RoomPosition,
  matrix: Int8Array,
  terrain: RoomTerrain,
  mark: number = -2,
) {
  const miningPos =
    typeof sourcePosition === 'string'
      ? roomPos(sourcePosition, room.name)
      : sourcePosition
  whirl(miningPos.x, miningPos.y, (x, y) => {
    const plain = terrain.get(x, y)
    if (plain === TERRAIN_MASK_WALL) return false
    const xy = pos(x, y)
    if (matrix[xy] !== 0) return false
    matrix[xy] = mark
    return true
  })
}
