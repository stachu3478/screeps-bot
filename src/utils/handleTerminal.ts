import _ from 'lodash'

interface SomeMap {
  [key: string]: number
}

const tradeBlackList = ["W4N29", "W6N33", "W7N33", "W9N32", "W11N35", "W11N34", "W11N25", "W5N31", "E1N29", "W11N25", "W8N38", "W9N38", "W9N39", "W13N33", "W12N37", "W13N33", "W15N32", "W15N29", "W16N39", "W22N21", "RoyalKnight", "sjfhsjfh", "TPEZ", "Unwannadie", "WheatEars", "wjx123xxx", "wyt", "Yuandiaodiaodiao", "ZAchiever", "zzsstt644"]
const tradeBlackMap: SomeMap = {}
tradeBlackList.forEach(n => {
  tradeBlackMap[n] = 1
})
const storagePerResource = Math.floor(TERMINAL_CAPACITY / RESOURCES_ALL.length)

export default function handleTerminal(terminal: StructureTerminal, resourceType: ResourceConstant) {
  if (terminal.cooldown) return

  let excessLocalAmount = terminal.store[resourceType] - storagePerResource * 3
  if (excessLocalAmount > TERMINAL_MIN_SEND) {
    for (const name in Memory.myRooms) {
      const room = Game.rooms[name]
      if (!room) continue
      const roomTerminal = room.terminal
      if (!roomTerminal || !roomTerminal.my) continue
      const missing = storagePerResource - roomTerminal.store[resourceType]
      if (missing < TERMINAL_MIN_SEND) continue
      const toSend = Math.min(missing, excessLocalAmount)
      terminal.send(resourceType, toSend, name)
      return
    }
  }

  const excessResourceAmount = terminal.store[resourceType] - storagePerResource * 3
  if (excessResourceAmount > TERMINAL_MIN_SEND) {
    const room = terminal.room
    const orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType }); // fast
    const bestOrder = _.max(orders, (o) => {
      const destRoomName = o.roomName
      if (!destRoomName || tradeBlackMap[destRoomName]) return -Infinity // don't trust black deals :>
      return o.price - Game.market.calcTransactionCost(1, room.name, destRoomName) / 5
    })
    if (bestOrder) {
      Game.market.deal(bestOrder.id, Math.min(terminal.store[resourceType], excessResourceAmount), room.name)
    }
  }
}
