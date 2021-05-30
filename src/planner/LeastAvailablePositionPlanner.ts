import { isWalkable } from 'utils/path'
import whirl from 'utils/whirl'

export default class LeastAvailablePositionPlanner {
  private room: Room
  private position: RoomPosition

  constructor(room: Room) {
    this.room = room
    this.position = this.generate()
  }

  get roomPosition() {
    return this.position
  }

  private generate() {
    const room = this.room
    const positions = PathFinder.search(
      room.sources.colonyPosition,
      room.find(FIND_EXIT).map((pos) => ({ pos, range: 500 })),
      { flee: true, maxRooms: 1, swampCost: 2 },
    ).path
    let lastPosition = positions.find((p) => !p.lookFor(LOOK_STRUCTURES).length)
    if (!lastPosition) {
      const xy = whirl(
        25,
        25,
        (x, y) =>
          isWalkable(room, x, y) &&
          !room.lookForAt(LOOK_STRUCTURES, x, y).length,
      )
      if (!xy) throw new Error('Failed to find least available position')
      lastPosition = new RoomPosition(xy[0], xy[1], room.name)
    }
    return lastPosition
  }
}
