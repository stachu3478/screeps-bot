import { ALL_EXIT_CONSTANTS } from 'constants/support'
import _ from 'lodash'
import ThrespassPathfinder from './military/ThrespassPathfinder'

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

export interface RoomNeighbour {
  cost: number
  x: number
  y: number
  newX: number
  newY: number
  dir: FindExitConstant | string
}
export default class RoomNeighbourPathScanner {
  private room: Room

  constructor(room: Room) {
    this.room = room
  }

  /**
   * Returns array of path length info to exits from specified position
   */
  findExitPaths(from: RoomPosition) {
    const paths: RoomNeighbour[] = []
    this.collectPathsFromExits(from, paths)
    this.collectPathsFromPortals(from, paths)
    return paths
  }

  private collectPathsFromExits(from: RoomPosition, paths: RoomNeighbour[]) {
    const exitConstant = this.getExitConstantFromRoomPosition(from)
    ALL_EXIT_CONSTANTS.filter((c) => c !== exitConstant).forEach((c) => {
      const targets = this.room.find(c)
      if (!targets.length) return
      const result = PathFinder.search(from, targets, pathfindingOpts) // new ThrespassPathfinder(from, targets).search(this.room) //
      if (result.incomplete) return
      const lastPosition = _.last(result.path)
      const mirror = lastPosition.mirror
      paths.push({
        cost: result.cost + 1,
        x: lastPosition.x,
        y: lastPosition.y,
        newX: mirror.x,
        newY: mirror.y,
        dir: c,
      })
    })
  }

  private collectPathsFromPortals(from: RoomPosition, paths: RoomNeighbour[]) {
    const interRoomPortals = this.room
      .find(FIND_STRUCTURES)
      .filter(
        (s) =>
          s.structureType === STRUCTURE_PORTAL &&
          s.destination instanceof RoomPosition,
      ) as StructurePortal[]
    const portalDestinationsByRooms = _.groupBy(
      interRoomPortals,
      (p) => (p.destination as RoomPosition).roomName,
    )
    _.forEach(portalDestinationsByRooms, (portals, roomName) => {
      const roomPositions = portals.map((p) => p.pos)
      const pathFinderTargets = roomPositions.map((pos) => ({ pos, range: 1 }))
      if (!roomName) {
        return
      }
      const result = PathFinder.search(from, pathFinderTargets, pathfindingOpts)
      if (result.incomplete) {
        return
      }
      const foundPortal = _.last(result.path)
        ?.lookForAtInRange(LOOK_STRUCTURES, 1)
        .find(
          (p) =>
            p.structure.structureType === STRUCTURE_PORTAL &&
            (p.structure as StructurePortal).destination instanceof
              RoomPosition,
        )?.structure as StructurePortal | undefined
      if (!foundPortal) {
        return
      }
      const lastPosition = foundPortal.pos
      const destination = foundPortal.destination as RoomPosition
      paths.push({
        cost: result.cost + 1,
        x: lastPosition.x,
        y: lastPosition.y,
        newX: destination.x,
        newY: destination.y,
        dir: roomName,
      })
    })
  }

  private getExitConstantFromRoomPosition(pos: RoomPosition | PathStep) {
    if (pos.y === 0) return FIND_EXIT_TOP
    if (pos.y === 49) return FIND_EXIT_BOTTOM
    if (pos.x === 0) return FIND_EXIT_LEFT
    if (pos.x === 49) return FIND_EXIT_RIGHT
    return null
  }
}
