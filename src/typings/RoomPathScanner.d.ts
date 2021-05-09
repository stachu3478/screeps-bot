declare class RoomPathScanner {
  traverse(): void
  done: boolean
  rooms: { [key: string]: RoomNeighbourPath | undefined }
}
