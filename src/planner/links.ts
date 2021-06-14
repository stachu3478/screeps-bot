import whirl from 'utils/whirl'
import StructureMatrix from './StructureMatrix'

// prosper for a link
export default function planLink(
  miningPos: RoomPosition,
  structureMatrix: StructureMatrix,
  color: number,
) {
  whirl(miningPos.x, miningPos.y, (x, y) => {
    const targetPos = new RoomPosition(x, y, miningPos.roomName)
    if (!structureMatrix.canBeAdded(targetPos)) {
      return false
    }
    structureMatrix.add(targetPos, color)
    return true
  })
}
