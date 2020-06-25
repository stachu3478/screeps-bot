import _ from 'lodash'
import { NOTHING_TODO, FAILED, SUCCESS, DONE, NO_RESOURCE } from 'constants/response';
import { getAverageCost, tradeBlackMap, energyCost } from 'utils/handleTerminal';
import { storageSellThreshold } from 'config/terminal'

export default function sellExcess(terminal: StructureTerminal) {
  const room = terminal.room
  const resourceType = room.memory.terminalDealResourceType
  if (!resourceType) return NOTHING_TODO
  const averageCost = getAverageCost(resourceType)
  const excessResourceAmount = room.store(resourceType) - storageSellThreshold
  const amountInTerminal = terminal.store[resourceType]
  if (Math.min(excessResourceAmount, amountInTerminal) <= TERMINAL_MIN_SEND) return NO_RESOURCE
  const orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType }); // fast
  const bestOrder = _.max(orders, (o) => {
    const destRoomName = o.roomName
    if (!destRoomName || tradeBlackMap[destRoomName]) return -Infinity // don't trust black deals :>
    return TERMINAL_MIN_SEND * o.price * averageCost - Game.market.calcTransactionCost(TERMINAL_MIN_SEND, room.name, destRoomName) * energyCost
  })
  if (bestOrder) {
    let amountToDeal = Math.min(excessResourceAmount, amountInTerminal)
    while (Game.market.calcTransactionCost(amountToDeal, room.name, bestOrder.roomName || '') > terminal.store[RESOURCE_ENERGY]) amountToDeal /= 2
    const result = Game.market.deal(bestOrder.id, amountToDeal, room.name)
    if (result !== 0) return FAILED
    return SUCCESS
  }
  return DONE
}
