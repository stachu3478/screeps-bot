import player from 'constants/player'
import defineGetter from 'utils/defineGetter'

function defineControllerGetter<T extends keyof StructureController>(
  property: T,
  handler: (self: StructureController) => StructureController[T],
) {
  defineGetter<StructureController, StructureControllerConstructor, T>(
    StructureController,
    property,
    handler,
  )
}

defineControllerGetter('attackable', (self) => {
  return (
    (self.reservation && self.reservation.username !== player) ||
    !!(self.level && !self.my)
  )
})
