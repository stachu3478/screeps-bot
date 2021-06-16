import { ALL_EXIT_CONSTANTS } from 'constants/support'
import PathMatrix from '../PathMatrix'

// make potencial paths and block eventual replacement
// add potencial paths that could be blocked by planned structures
export default function planPotencialPaths(
  room: Room,
  furthestSourcePos: RoomPosition,
  pathMatrix: PathMatrix,
) {
  // exit positions
  ALL_EXIT_CONSTANTS.forEach((exitConstant) => {
    const exits = room.find(exitConstant)
    if (!exits.length) {
      return
    }
    pathMatrix.addClosest(furthestSourcePos, exitConstant, 1)
  })
}
