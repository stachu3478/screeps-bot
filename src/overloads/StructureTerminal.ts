import defineGetter from 'utils/defineGetter'

function defineTerminalGetter<T>(
  property: string,
  handler: (self: StructureTerminal) => T,
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
