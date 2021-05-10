declare class RoomLocation {
  x: number
  y: number
  findRoomPathStep(current: string, to: string): RoomNeighbourPath | undefined
  getNeighbour(
    direction:
      | FIND_EXIT_TOP
      | FIND_EXIT_RIGHT
      | FIND_EXIT_LEFT
      | FIND_EXIT_BOTTOM,
  ): string
}
