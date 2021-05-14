import defineGetter from 'utils/defineGetter'
import BusinessHandler from 'handler/BusinessHandler'

function defineTerminalGetter<T extends keyof StructureTerminal>(
  property: T,
  handler: (self: StructureTerminal) => StructureTerminal[T],
) {
  defineGetter<StructureTerminal, StructureTerminalConstructor, T>(
    StructureTerminal,
    property,
    handler,
  )
}

defineTerminalGetter('cache', (self) => {
  const cache = global.Cache.terminals
  return cache[self.room.name] || (cache[self.room.name] = {})
})

defineTerminalGetter('businessHandler', (self) => {
  const cache = self.cache
  return (
    cache.businessHandler || (cache.businessHandler = new BusinessHandler(self))
  )
})
