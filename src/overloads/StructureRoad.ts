import defineGetter from 'utils/defineGetter'

function defineRoadGetter<T extends keyof StructureRoad>(
  property: T,
  handler: (self: StructureRoad) => StructureRoad[T],
) {
  defineGetter<StructureRoad, StructureRoadConstructor, T>(
    StructureRoad,
    property,
    handler,
  )
}

defineRoadGetter('vaporTime', (self) => {
  return (
    Game.time +
    ROAD_DECAY_TIME * Math.floor(self.hits / ROAD_DECAY_AMOUNT) +
    self.ticksToDecay
  )
})
