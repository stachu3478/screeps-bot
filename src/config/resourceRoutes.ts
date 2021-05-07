import { energyToNukerThreshold } from './storage'
import ResourceRoute from 'job/resourceRoute/ResourceRoute'
import { energyBufferingThreshold } from './terminal'

/**
 * All definitions of the system of transferring
 * resources along your base
 */
export default [
  // collect energy to storage
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  // fill everything with energy from containers when no storage
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_TOWER,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  {
    from: STRUCTURE_CONTAINER,
    to: (room: Room) => room.spawnsAndExtensions,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  // fill everything with energy from storage
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_TOWER,
    type: RESOURCE_ENERGY,
  },
  {
    from: STRUCTURE_STORAGE,
    to: (room: Room) => room.spawnsAndExtensions,
    type: RESOURCE_ENERGY,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_LAB,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: 10000,
  },
  // balanced transfer between link and storage
  {
    from: STRUCTURE_STORAGE,
    to: (room: Room) => (room.spawnLink ? [room.spawnLink] : []),
    type: RESOURCE_ENERGY,
    minimalFreeCapacityToFill: LINK_CAPACITY,
    maximumFilledAmount: (LINK_CAPACITY * 3) / 4,
    minimalStoreToDraw: 10000,
  },
  {
    from: (room: Room) => (room.spawnLink ? [room.spawnLink] : []),
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: LINK_CAPACITY,
    keep: LINK_CAPACITY / 4,
  },
  // fill more expensive things with energy
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_POWER_SPAWN,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: 10000,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_NUKER,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: energyToNukerThreshold,
  },
  // storage & terminal exchange
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_TERMINAL,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: 20000,
    maximumFilledAmount: energyBufferingThreshold,
  },
  {
    from: STRUCTURE_TERMINAL,
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    maximumFilledAmount: 5000,
    dump: true,
  },
  /*{
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_TERMINAL,
    type: (r: ResourceConstant) => r !== RESOURCE_ENERGY,
    maximumFilledAmount: storageBufferingThreshold,
    dump: true,
  },
  {
    from: STRUCTURE_TERMINAL,
    to: STRUCTURE_STORAGE,
    type: (r: ResourceConstant) => r !== RESOURCE_ENERGY,
    keep: 5000,
    dump: true,
  },*/
  // fill powerspawn with power
  {
    from: STRUCTURE_TERMINAL,
    to: STRUCTURE_POWER_SPAWN,
    type: RESOURCE_POWER,
    minimalStoreToDraw: 1000,
    dump: true,
  },
  // fill nuker with ghodium
  {
    from: STRUCTURE_TERMINAL,
    to: STRUCTURE_NUKER,
    type: RESOURCE_GHODIUM,
    minimalStoreToDraw: 2000,
    dump: true,
  },
].map((options) => new ResourceRoute(options))
