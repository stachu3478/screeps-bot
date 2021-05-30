import { energyToNukerThreshold } from '../storage'
import ResourceRoute from 'job/resourceRoute/ResourceRoute'
import { energyBufferingThreshold } from '../terminal'

/**
 * All definitions of the system of transferring
 * resources along your base
 */
export default [
  // collect energy to storage
  // from containers if no link present
  {
    from: () => [],
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    dump: true, // temp dump resources on start searching
  },
  {
    from: (room: Room) => {
      const container = room.sources.colonyPosition.building(
        STRUCTURE_CONTAINER,
      )
      return container ? [container] : []
    },
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
    maximumFilledAmount: 1000,
    if: (c: Structure) =>
      !c.room.buildings.links.some((l) => l.pos.isNearTo(c)),
  },
  // fill everything with energy from storage
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_TOWER,
    type: RESOURCE_ENERGY,
  },
  {
    from: STRUCTURE_STORAGE,
    to: (room: Room) => room.buildings.spawnsWithExtensions,
    type: RESOURCE_ENERGY,
    minimalFreeCapacityToFill: 1,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_LAB,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: 10000,
  },
  // fill everything with energy from containers when no storage
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_TOWER,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
    if: (c: Structure) => !c.room.storage,
  },
  {
    from: STRUCTURE_CONTAINER,
    to: (room: Room) => room.buildings.spawnsWithExtensions,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
    minimalFreeCapacityToFill: 1,
    if: (c: Structure) => !c.room.storage,
  },
  // balanced transfer between link and storage
  {
    from: STRUCTURE_STORAGE,
    to: (room: Room) => (room.links.spawny ? [room.links.spawny] : []),
    type: RESOURCE_ENERGY,
    minimalFreeCapacityToFill: (LINK_CAPACITY * 7) / 8 + 1,
    maximumFilledAmount: (LINK_CAPACITY * 7) / 8,
    minimalStoreToDraw: 10000,
  },
  {
    from: (room: Room) => (room.links.spawny ? [room.links.spawny] : []),
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: (LINK_CAPACITY * 7) / 8 + 1,
    keep: LINK_CAPACITY / 8,
  },
  // fill more expensive things with energy
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_POWER_SPAWN,
    type: RESOURCE_ENERGY,
    minimalFreeCapacityToFill: POWER_SPAWN_ENERGY_CAPACITY / 2,
    minimalStoreToDraw: 30000,
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
    from: () => [],
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
  },
  // route id 13 always has bugs idk ^
  {
    from: STRUCTURE_TERMINAL,
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    maximumFilledAmount: 10000,
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
