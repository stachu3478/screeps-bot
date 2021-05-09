const pathfindingOpts: PathFinderOpts = {
  maxRooms: 1,
  plainCost: 1,
  swampCost: 5,
  roomCallback: (roomName) => {
    const room = Game.rooms[roomName]
    const costs = new PathFinder.CostMatrix()
    room.find(FIND_STRUCTURES).forEach((s) => {
      if (s.isWalkable) return
      // Can't walk through non-walkable buildings
      costs.set(s.pos.x, s.pos.y, 0xff)
    })
    return costs
  },
}
export type FindExitConstant =
  | FIND_EXIT_TOP
  | FIND_EXIT_RIGHT
  | FIND_EXIT_LEFT
  | FIND_EXIT_BOTTOM
export const exitConstants: FindExitConstant[] = [
  FIND_EXIT_TOP,
  FIND_EXIT_RIGHT,
  FIND_EXIT_LEFT,
  FIND_EXIT_BOTTOM,
]
export interface RoomNeighbour {
  cost: number
  x: number
  y: number
  dir: FindExitConstant
}
export default class RoomNeighbourPathScanner {
  private room: Room

  constructor(room: Room) {
    this.room = room
  }

  /**
   * Returns array of path length info to exits from specified position
   * -1 at [0] means no path
   */
  findExitPaths(from: RoomPosition) {
    const exitConstant = this.getExitConstantFromRoomPosition(from)
    const paths: RoomNeighbour[] = []
    exitConstants
      .filter((c) => c !== exitConstant)
      .forEach((c) => {
        const targets = this.room.find(c).map((pos) => ({ pos, range: 0 }))
        if (!targets.length) return
        const result = PathFinder.search(from, targets, pathfindingOpts)
        if (result.incomplete) return
        const lastPosition = result.path[result.path.length - 1]
        paths.push({
          cost: result.cost + 1,
          x: this.reverseCord(lastPosition.x),
          y: this.reverseCord(lastPosition.y),
          dir: c,
        })
      })
    return paths
  }

  private getExitConstantFromRoomPosition(pos: RoomPosition | PathStep) {
    if (pos.y === 0) return FIND_EXIT_TOP
    if (pos.y === 49) return FIND_EXIT_BOTTOM
    if (pos.x === 0) return FIND_EXIT_LEFT
    if (pos.x === 49) return FIND_EXIT_RIGHT
    return null
  }

  private reverseCord(v: number) {
    if (v === 0) return 49
    if (v === 49) return 0
    return v
  }
}
