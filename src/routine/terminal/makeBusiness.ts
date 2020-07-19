import _ from 'lodash'
import { DONE, NOTHING_DONE, FAILED, SUCCESS } from "constants/response";
import { energyCost } from 'utils/handleTerminal';

function calcCost(room1: string, room2?: string) {
  if (room2) return Game.market.calcTransactionCost(TERMINAL_MIN_SEND, room1, room2)
  return Infinity
}

const fromSell = (roomName: string) => (o: Order) => TERMINAL_MIN_SEND * -o.price - calcCost(roomName, o.roomName) * energyCost
const fromBuy = (roomName: string) => (o: Order) => TERMINAL_MIN_SEND * o.price - calcCost(roomName, o.roomName) * energyCost

export default function makeBusiness(term: StructureTerminal) {
  const cache = term.cache
  let iteration = cache.resourceIteration || 0
  if (!cache.resourceIteration) iteration = cache.resourceIteration = 0
  const resourceType = RESOURCES_ALL[iteration]
  if (!resourceType) return DONE
  const roomName = term.room.name
  const buyOrders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType })
    .filter(o => o.amount >= TERMINAL_MIN_SEND)
  const buyCalc = fromBuy(roomName)
  const bestBuyOrder = _.max(buyOrders, buyCalc)
  if (cache.businessSell) {
    const bestBuyOrder = _.max(buyOrders, buyCalc)
    const result = Game.market.deal(bestBuyOrder.id, cache.businessAmount || 0, roomName)
    cache.businessSell = 0
    cache.resourceIteration++
    if (result !== 0) {
      console.log('Oh no! Something went wrong during sell!')
      return FAILED
    }
    return SUCCESS
  } else {
    const sellOrders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType })
      .filter(o => o.amount >= TERMINAL_MIN_SEND)

    const sellCalc = fromSell(roomName)
    const bestSellOrder = _.max(sellOrders, sellCalc)

    const pros = Math.floor(buyCalc(bestBuyOrder))
    const cons = Math.floor(sellCalc(bestSellOrder))
    const victims = pros + cons
    if (victims > 0) {
      console.log('It is a ludicrous occasion! ', pros, cons, energyCost, JSON.stringify({
        buy: bestBuyOrder,
        sell: bestSellOrder
      }))
      const amount = Math.min(bestBuyOrder.amount, bestSellOrder.amount)
      const primaryCost = bestSellOrder.price * amount
      if (primaryCost > Game.market.credits) {
        console.log('But i have not enough money ;-;')
        cache.resourceIteration++
        return NOTHING_DONE
      }
      const result = Game.market.deal(bestSellOrder.id, amount, roomName)
      if (result !== 0) {
        console.log('Oh no! Something went wrong!')
        cache.resourceIteration++
        return FAILED
      }
      cache.businessAmount = amount
      cache.businessSell = 1
    } else {
      cache.resourceIteration++
    }
  }
  return NOTHING_DONE
}
