import _ from 'lodash'
import handleLab from './handleLab'
import handleFactory from './handleFactory'
import MyRooms from 'room/MyRooms'
import EnemiesPlanner from 'planner/military/EnemiesPlanner'

function canTradeWith(roomName: string) {
  let roomPath: RoomNeighbourPath | undefined
  MyRooms.get().find((r) => {
    return (roomPath = r.pathScanner.rooms[roomName])
  })
  if (!roomPath) {
    return false
  }
  return !EnemiesPlanner.instance.isTradeDisallowed(roomPath.owner)
}

export function getOrderValue(room: Room, o: Order, blackValue: number) {
  const destRoomName = o.roomName
  if (o.amount === 0) {
    return blackValue
  }
  if (!destRoomName) {
    return o.price
  }
  if (!canTradeWith(destRoomName)) {
    return blackValue // don't trust black deals :>
  }
  return (
    TERMINAL_MIN_SEND * o.price +
    Game.market.calcTransactionCost(
      TERMINAL_MIN_SEND,
      room.name,
      destRoomName,
    ) *
      energyCost
  )
}

export function getAverageCost(resourceType: ResourceConstant) {
  try {
    const recentHistory = _.max(
      Game.market.getHistory(resourceType),
      (h) => new Date(h.date),
    )
    if (typeof recentHistory == 'number') return 0.1
    return recentHistory.avgPrice
  } catch (e) {
    // sim error
    return 0.1
  }
}

export const energyCost = getAverageCost(RESOURCE_ENERGY)

export default function handleTerminal(
  terminal: StructureTerminal,
  resourceType: ResourceConstant,
) {
  const mem = terminal.room.memory
  const cache = terminal.cache
  cache.state = State.TERM_SEND_EXCESS
  cache.dealResourceType = resourceType
  handleLab.run(terminal)
  if (!mem.structs) return
  const factory = terminal.room.buildings.factory
  if (factory) handleFactory(factory)
}
