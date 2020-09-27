import _ from 'lodash'
import handleLab from './handleLab'
import handleFactory from './handleFactory'

interface SomeMap {
  [key: string]: number
}

export function getAverageCost(resourceType: ResourceConstant) {
  const recentHistory = _.max(
    Game.market.getHistory(resourceType),
    (h) => new Date(h.date),
  )
  if (typeof recentHistory == 'number') return 0.1
  return recentHistory.avgPrice
}

export const energyCost = getAverageCost(RESOURCE_ENERGY)
const tradeBlackList = [
  'W4N29',
  'W6N33',
  'W7N33',
  'W9N32',
  'W11N35',
  'W11N34',
  'W11N25',
  'W5N31',
  'E1N29',
  'W11N25',
  'W8N38',
  'W9N38',
  'W9N39',
  'W13N33',
  'W12N37',
  'W13N33',
  'W15N32',
  'W15N29',
  'W16N39',
  'W22N21',
  'RoyalKnight',
  'sjfhsjfh',
  'TPEZ',
  'Unwannadie',
  'WheatEars',
  'wjx123xxx',
  'wyt',
  'Yuandiaodiaodiao',
  'ZAchiever',
  'zzsstt644',
]
export const tradeBlackMap: SomeMap = {}
tradeBlackList.forEach((n) => {
  tradeBlackMap[n] = 1
})

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
  const factory = terminal.room.factory
  if (factory) handleFactory(terminal.store, factory)
}
