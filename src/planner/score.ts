import whirl from 'utils/whirl'
import { isWalkable } from 'utils/path'
import { getXYWall } from 'utils/selectFromPos'
import { posToChar } from './pos'
import charPosIterator from 'utils/charPosIterator'

function getWallDigCost(room: Room, x: number, y: number) {
  const constructedWall = getXYWall(room, x, y)
  if (!constructedWall) return 0
  return Math.ceil((100 * constructedWall.hits) / constructedWall.hitsMax)
}

function generateScoreDigPath(scoreCollector: StructureContainer) {
  const pathfindingEntry = whirl(
    scoreCollector.pos.x,
    scoreCollector.pos.y,
    (x, y) => isWalkable(scoreCollector.room, x, y),
  )
  if (!pathfindingEntry) return false
  const pathFindingEntryRoomPosition = scoreCollector.room.getPositionAt(
    pathfindingEntry[0],
    pathfindingEntry[1],
  )
  if (!pathFindingEntryRoomPosition) return false
  const { path } = PathFinder.search(
    pathFindingEntryRoomPosition,
    scoreCollector.pos,
    {
      maxCost: 100 * WALLS_RADIUS,
      plainCost: 0,
      swampCost: 0,
      roomCallback: (roomName) => {
        if (roomName !== scoreCollector.room.name) return false
        const matrix = new PathFinder.CostMatrix()
        for (
          let x = scoreCollector.pos.x - WALLS_RADIUS;
          x <= scoreCollector.pos.x + WALLS_RADIUS;
          x++
        )
          for (
            let y = scoreCollector.pos.y - WALLS_RADIUS;
            y <= scoreCollector.pos.y + WALLS_RADIUS;
            y++
          ) {
            matrix.set(x, y, getWallDigCost(scoreCollector.room, x, y))
          }
        return matrix
      },
    },
  )
  const wallPath = path.slice(path.length - 6, path.length - 1) // last 5 entries
  const charPath = wallPath.map(posToChar).join('')
  return (scoreCollector.room.memory._scorePlan = charPath)
}

function getDigCost(room: Room, path: string) {
  let sum = 0
  charPosIterator(path, (x, y) => {
    sum += getWallDigCost(room, x, y)
  })
  return sum
}

export function advanceRoomToCollector(room: Room, roomMemory: RoomMemory) {
  if (roomMemory._dig === room.name) delete roomMemory._dig
  if (!roomMemory._rangedAttack && !roomMemory._score) {
    roomMemory._rangedAttack = room.name
    roomMemory._score = room.name
  }
}

const WALLS_RADIUS = 5
export default function scorePlanner(room: Room, roomMemory: RoomMemory) {
  const scoreCollector = room.find(
    10012 as FindConstant,
  )[0] as StructureContainer
  if (!scoreCollector) return false
  const scorePlan =
    room.memory._scorePlan || generateScoreDigPath(scoreCollector)
  if (!scorePlan) return false
  const cost = getDigCost(room, scorePlan)
  if (cost) {
    if (!roomMemory._dig) roomMemory._dig = room.name
  } else {
    advanceRoomToCollector(room, roomMemory)
  }
  return true
}
