import _ from 'lodash'
import { NOTHING_TODO, SUCCESS, DONE } from 'constants/response'
import { getOrderValue } from 'utils/handleTerminal'
import { resourcesToBuy, storageBuyThreshold } from 'config/terminal'

export default function buyMissing(terminal: StructureTerminal) {
  const room = terminal.room
  const missingResource = resourcesToBuy.find(
    (resource) => room.store(resource) < storageBuyThreshold,
  )
  if (!missingResource) return DONE
  const missingAmount = storageBuyThreshold - room.store(missingResource)
  const orders = Game.market.getAllOrders({
    type: ORDER_SELL,
    resourceType: missingResource,
  })
  if (!orders.length) return NOTHING_TODO
  const best = _.min(orders, (o) => {
    return getOrderValue(room, o, Infinity)
  })
  const result = Game.market.deal(
    best.id,
    Math.min(missingAmount, best.amount, terminal.store[missingResource]),
    room.name,
  )
  if (result === 0) {
    return SUCCESS
  }
  return NOTHING_TODO
}
