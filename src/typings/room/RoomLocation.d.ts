declare class RoomLocation {
  x: number
  y: number
  inRangeTo(room: Room, range: number): boolean
  findRoomPathStep(
    current: string,
    to: string,
    using?: Room,
  ): RoomNeighbourPath | undefined
  getNeighbour(
    direction:
      | FIND_EXIT_TOP
      | FIND_EXIT_RIGHT
      | FIND_EXIT_LEFT
      | FIND_EXIT_BOTTOM,
  ): string
}
