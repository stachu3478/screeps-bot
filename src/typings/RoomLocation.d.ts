declare class RoomLocation {
  x: number
  y: number
  getNeighbour(
    direction:
      | FIND_EXIT_TOP
      | FIND_EXIT_RIGHT
      | FIND_EXIT_LEFT
      | FIND_EXIT_BOTTOM,
  ): string
}
