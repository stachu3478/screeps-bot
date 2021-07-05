declare class RoomPathScanner {
  done: boolean
  rooms: { [key: string]: RoomNeighbourPath | undefined }
  scanTarget?: string
  getMaxDamage(roomName: string): number | undefined
}
