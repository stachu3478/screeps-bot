declare class SourceHandler {
  constructor(room: Room)

  assign(creepName: string, sourceId?: string): void
  getPosition(sourceId: string): RoomPosition
  getDistance(sourceId: string): number
  positions: RoomPosition[]
  colonyPosition: RoomPosition
  free?: string
}
