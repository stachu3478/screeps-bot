declare class RoomOutpostDefense {
  request(room: Room): void
  fulfillBody(): RangerBodyPartConstant[] | false
  targetRoom: string
}
