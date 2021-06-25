declare class RoomOutpostDefense {
  request(room: Room): void
  fulfillBody(): RangerBodyPartConstant[] | false
  cancel(): void
  targetRoom: string
}
