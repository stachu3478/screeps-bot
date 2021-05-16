declare class SourceHandler {
  constructor(room: Room)

  assign(creepName: string, sourceIndex?: number): void
  getPosition(sourceIndex: number): RoomPosition
  getDistance(sourceIndex: number): number
  positions: RoomPosition[]
  colonyPosition: RoomPosition
  free: number
}
