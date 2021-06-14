import { ALL_EXIT_CONSTANTS } from 'constants/support'
import PathMatrix from './PathMatrix'

// make potencial paths and block eventual replacement
// add potencial paths that could be blocked by planned structures
export default function planPotencialPaths(
  room: Room,
  furthestSourcePos: RoomPosition,
  pathMatrix: PathMatrix,
) {
  // mineral
  const mineral = room.mineral
  if (mineral) {
    pathMatrix.add(furthestSourcePos, mineral.pos, 1)
    pathMatrix.markOffsets(mineral.pos) // for multicreep mining
  }
  // exit positions
  ALL_EXIT_CONSTANTS.forEach((exitConstant) => {
    const exits = room.find(exitConstant)
    if (!exits.length) {
      return
    }
    pathMatrix.addClosest(furthestSourcePos, exitConstant, 1)
  })
}
