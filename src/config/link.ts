import _ from 'lodash'

type LinkConstant = 'both' | 'drain' | 'collect'
interface LinkRoute<T extends LinkConstant> extends LinkRouteBase {
  mode: T
  minFreeCapacityToFill?: T extends 'collect' | 'both' ? number : never
  minStoredToTransfer?: T extends 'drain' | 'both' ? number : never
}

interface LinkRouteBase {
  links: (room: Room) => StructureLink[]
  mode: LinkConstant
}
const routes: LinkRoute<LinkConstant>[] = [
  {
    links: (room: Room) => room.links.drains,
    mode: 'drain',
    minStoredToTransfer: 100,
  },
  {
    links: (room: Room) => {
      const link = room.links.spawny
      return link ? [link] : []
    },
    mode: 'both',
    minFreeCapacityToFill: 100,
    minStoredToTransfer: 100,
  },
  {
    links: (room: Room) => {
      const link = room.links.controller
      return link ? [link] : []
    },
    mode: 'collect',
    minFreeCapacityToFill: 100,
  },
]

export default routes
