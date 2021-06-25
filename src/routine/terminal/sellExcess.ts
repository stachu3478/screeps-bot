import _ from 'lodash'
import {
  NOTHING_TODO,
  FAILED,
  SUCCESS,
  DONE,
  NO_RESOURCE,
} from 'constants/response'
import { getOrderValue } from 'utils/handleTerminal'
import { storageSellThreshold } from 'config/terminal'

export default function sellExcess(terminal: StructureTerminal) {
  const room = terminal.room
  const cache = terminal.cache
  const resourceType = cache.dealResourceType
  if (!resourceType) return NOTHING_TODO
  const excessResourceAmount = room.store(resourceType) - storageSellThreshold
  const amountInTerminal = terminal.store[resourceType]
  let amountToDeal = Math.min(excessResourceAmount, amountInTerminal)
  if (amountToDeal <= TERMINAL_MIN_SEND) return NO_RESOURCE
  const orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType }) // fast
  const bestOrder = _.max(orders, (o) => {
    return getOrderValue(room, o, -Infinity)
  })
  if (bestOrder) {
    while (
      Game.market.calcTransactionCost(
        amountToDeal,
        room.name,
        bestOrder.roomName || '',
      ) > terminal.store[RESOURCE_ENERGY]
    ) {
      amountToDeal /= 2
    }
    const result = Game.market.deal(bestOrder.id, amountToDeal, room.name)
    if (result !== 0) return FAILED
    return SUCCESS
  }
  return DONE
}
