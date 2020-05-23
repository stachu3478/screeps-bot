import PlannerMatrix from "./matrix";
import xyToChar from "./pos";

// make potencial paths and block eventual replacement
export default function planPotencialPaths(room: Room, furthestSource: Source, pm: PlannerMatrix, roomCallback: (name: string) => false | CostMatrix) {
  const matrix = pm.getMatrix()
  const potencialPositions: RoomPosition[] = []
  const potencialPaths: RoomPosition[][] = []
  const sourcePos = furthestSource.pos

  const mineral = room.mineral
  if (mineral) potencialPositions.push(mineral.pos)

  const exitTop = sourcePos.findClosestByRange(FIND_EXIT_TOP)
  if (exitTop) potencialPositions.push(exitTop)
  const exitLeft = sourcePos.findClosestByRange(FIND_EXIT_LEFT)
  if (exitLeft) potencialPositions.push(exitLeft)
  const exitRight = sourcePos.findClosestByRange(FIND_EXIT_RIGHT)
  if (exitRight) potencialPositions.push(exitRight)
  const exitBottom = sourcePos.findClosestByRange(FIND_EXIT_BOTTOM)
  if (exitBottom) potencialPositions.push(exitBottom)

  potencialPositions.forEach(position => {
    potencialPaths.push(PathFinder.search(
      furthestSource.pos,
      { pos: position, range: 1 },
      { plainCost: 2, roomCallback }
    ).path)
  })
  potencialPaths.forEach(potencialPath => {
    potencialPath.forEach((s) => {
      if (matrix[xyToChar(s.x, s.y)] < 1) pm.setField(s.x, s.y, 100) // value to not place path
    })
  })
}
