import { energyToNukerThreshold } from './storage'
import ResourceRoute from 'job/resourceRoute/ResourceRoute'

export default [
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_STORAGE,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_TOWER,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_SPAWN,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  {
    from: STRUCTURE_CONTAINER,
    to: STRUCTURE_EXTENSION,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_TOWER,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: CONTAINER_CAPACITY / 2,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_TOWER,
    type: RESOURCE_ENERGY,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_SPAWN,
    type: RESOURCE_ENERGY,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_EXTENSION,
    type: RESOURCE_ENERGY,
  },
  {
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_LAB,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: 10000,
  },
  /*{
    from: STRUCTURE_STORAGE,
    to: STRUCTURE_TERMINAL,
    type: RESOURCE_ENERGY,
    minimalStoreToDraw: 20000,
  },*/
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
    dump: true,
  },
  {
    from: STRUCTURE_TERMINAL,
    to: STRUCTURE_POWER_SPAWN,
    type: RESOURCE_POWER,
    minimalStoreToDraw: 1000,
    dump: true,
  },
  {
    from: STRUCTURE_TERMINAL,
    to: STRUCTURE_NUKER,
    type: RESOURCE_GHODIUM,
    minimalStoreToDraw: 2000,
    dump: true,
  },
].map((options) => new ResourceRoute(options))
