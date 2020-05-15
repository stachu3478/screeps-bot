import _ from 'lodash'
import { NOTHING_TODO, FAILED, SUCCESS, DONE, NO_RESOURCE } from "constants/response";
import { getAverageCost, storagePerResource, tradeBlackMap, energyCost } from "utils/handleTerminal";

export default function sellExcess(terminal: StructureTerminal) {
  const resourceType = terminal.room.memory.terminalDealResourceType
  if (!resourceType) return NOTHING_TODO
  const averageCost = getAverageCost(resourceType)
  const excessResourceAmount = terminal.store[resourceType] - storagePerResource * 3
  if (excessResourceAmount <= TERMINAL_MIN_SEND) return NO_RESOURCE
  const room = terminal.room
  const orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType }); // fast
  const bestOrder = _.max(orders, (o) => {
    const destRoomName = o.roomName
    if (!destRoomName || tradeBlackMap[destRoomName]) return -Infinity // don't trust black deals :>
    return TERMINAL_MIN_SEND * o.price * averageCost - Game.market.calcTransactionCost(TERMINAL_MIN_SEND, room.name, destRoomName) * energyCost
  })
  if (bestOrder) {
    const result = Game.market.deal(bestOrder.id, Math.min(terminal.store[resourceType], excessResourceAmount), room.name)
    if (result !== 0) return FAILED
    return SUCCESS
  }
  return DONE
}
