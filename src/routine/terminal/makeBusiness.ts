import _ from 'lodash'
import { DONE, NOTHING_DONE, FAILED, SUCCESS } from "constants/response";
import { getAverageCost, energyCost } from 'utils/handleTerminal';

function calcCost(room1: string, room2?: string) {
  if (room2) return Game.market.calcTransactionCost(TERMINAL_MIN_SEND, room1, room2)
  return Infinity
}

const fromSell = (avg: number, roomName: string) => (o: Order) => TERMINAL_MIN_SEND * -o.price * avg - calcCost(roomName, o.roomName) * energyCost
const fromBuy = (avg: number, roomName: string) => (o: Order) => TERMINAL_MIN_SEND * o.price * avg - calcCost(roomName, o.roomName) * energyCost

export default function makeBusiness(term: StructureTerminal) {
  const mem = term.room.memory
  let iteration = mem.terminalResourceIteration || 0
  if (!mem.terminalResourceIteration) iteration = mem.terminalResourceIteration = 0
  const resourceType = RESOURCES_ALL[iteration]
  if (!resourceType) return DONE
  const averageCost = getAverageCost(resourceType)
  const roomName = term.room.name
  const buyOrders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType })
  const buyCalc = fromBuy(averageCost, roomName)
  const bestBuyOrder = _.max(buyOrders, buyCalc)
  if (mem.termBusinessSell) {
    const bestBuyOrder = _.max(buyOrders, buyCalc)
    const result = Game.market.deal(bestBuyOrder.id, mem.termBusinessAmount || 0, roomName)
    if (result !== 0) {
      console.log('Oh no! Something went wrong during sell!')
      return FAILED
    }
    mem.termBusinessSell = 0
    mem.terminalResourceIteration++
    return SUCCESS
  } else {
    const sellOrders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType })

    const sellCalc = fromSell(averageCost, roomName)
    const buyCalc = fromBuy(averageCost, roomName)
    const bestSellOrder = _.max(sellOrders, sellCalc)

    const victims = buyCalc(bestBuyOrder) + sellCalc(bestSellOrder)
    if (victims > 0) {
      console.log('It is a ludicrous occasion! ' + victims, JSON.stringify({
        buy: bestBuyOrder,
        sell: bestSellOrder
      }))
      const amount = Math.min(bestBuyOrder.amount, bestSellOrder.amount)
      const primaryCost = bestSellOrder.price * amount
      if (primaryCost > Game.market.credits) {
        console.log('But i have not enough money ;-;')
        mem.terminalResourceIteration++
        return NOTHING_DONE
      }
      const result = Game.market.deal(bestSellOrder.id, amount, roomName)
      if (result !== 0) {
        console.log('Oh no! Something went wrong!')
        mem.terminalResourceIteration++
        return FAILED
      }
      mem.termBusinessAmount = amount
      mem.termBusinessSell = 1
    } else {
      mem.terminalResourceIteration++
    }
  }
  return NOTHING_DONE
}
