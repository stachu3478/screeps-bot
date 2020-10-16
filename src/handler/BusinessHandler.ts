import _ from 'lodash'
import { energyCost } from 'utils/handleTerminal'

export default class BusinessHandler {
  private roomName: string
  private iteration: number
  private selling: boolean
  private sellAmount: number
  private resourceType: ResourceConstant
  constructor(terminal: StructureTerminal) {
    this.roomName = terminal.room.name
    this.iteration = 0
    this.selling = false
    this.sellAmount = 0
    this.resourceType = RESOURCES_ALL[0]
  }

  call() {
    if (!this.getResource()) return false
    if (this.selling) {
      this.sellExpensive()
    } else {
      this.buyCheap()
    }
    return true
  }

  private getResource() {
    const resourceType = RESOURCES_ALL[this.iteration]
    if (!resourceType) {
      this.iteration = 0
    } else this.resourceType = resourceType
    return !!resourceType
  }

  private sellExpensive() {
    const bestBuyOrder = _.max(this.getOrders(ORDER_BUY), this.orderBuyBalance)
    Game.market.deal(bestBuyOrder.id, this.sellAmount, this.roomName)
    this.selling = false
    this.iteration++
  }

  private buyCheap() {
    const bestBuyOrder = _.max(this.getOrders(ORDER_BUY), this.orderBuyBalance)
    const bestSellOrder = _.max(
      this.getOrders(ORDER_SELL),
      this.orderSellBalance,
    )
    const buyBalance = Math.floor(this.orderBuyBalance(bestBuyOrder))
    const sellBalance = Math.floor(this.orderSellBalance(bestSellOrder))
    const balance = buyBalance + sellBalance
    if (balance > 0) {
      const amount = Math.min(
        bestBuyOrder.amount,
        bestSellOrder.amount,
        Game.market.credits / bestSellOrder.price,
      )
      const result = Game.market.deal(bestSellOrder.id, amount, this.roomName)
      if (result === 0) {
        this.sellAmount = amount
        this.selling = true
        return
      }
    }
    this.iteration++
  }

  private getOrders(type: string) {
    return Game.market
      .getAllOrders({ type, resourceType: this.resourceType })
      .filter((o) => o.amount >= TERMINAL_MIN_SEND)
  }

  private orderSellBalance(order: Order) {
    return (
      TERMINAL_MIN_SEND * -order.price -
      this.calcCost(order.roomName) * energyCost
    )
  }

  private orderBuyBalance(order: Order) {
    return (
      TERMINAL_MIN_SEND * order.price -
      this.calcCost(order.roomName) * energyCost
    )
  }

  private calcCost(room2?: string) {
    if (room2)
      return Game.market.calcTransactionCost(
        TERMINAL_MIN_SEND,
        this.roomName,
        room2,
      )
    return Infinity
  }
}
