import _ from 'lodash'
import defineGetter from 'utils/defineGetter'
import BusinessHandler from 'handler/BusinessHandler'
import { cache } from './cache'

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

function memoizeByTerminal<T>(fn: (t: StructureTerminal) => T) {
  return _.memoize(fn, (t: StructureTerminal) => t.id)
}

defineTerminalGetter('cache', (self) => cache(self))

const terminalBusinessHandler = memoizeByTerminal((t) => new BusinessHandler(t))
defineTerminalGetter('businessHandler', (self) => terminalBusinessHandler(self))
