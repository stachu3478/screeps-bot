import { findStorageAndTerminal } from './building'
import RepairRoute from 'job/repairRoute/RepairRoute'

const fortificationsAndRoads: Record<string, 1 | undefined> = {
  [STRUCTURE_RAMPART]: 1,
  [STRUCTURE_ROAD]: 1,
  [STRUCTURE_WALL]: 1,
  [STRUCTURE_CONTAINER]: 1,
}
const findAllOther = (room: Room) =>
  room
    .find(FIND_STRUCTURES)
    .filter((s) => !fortificationsAndRoads[s.structureType]) as Structure<
    BuildableStructureConstant
  >[]
export default [
  // repair all other sturtures
  {
    structure: findAllOther,
    hits: Infinity,
    from: findStorageAndTerminal,
    minimalStore: 1000,
  },
  // repair very weak ramparts
  {
    structure: STRUCTURE_RAMPART,
    hits: 10000,
    from: findStorageAndTerminal,
    minimalStore: 1000,
  },
  // repair very weak roads
  {
    structure: STRUCTURE_ROAD,
    hits: 1000,
    from: findStorageAndTerminal,
    minimalStore: 1000,
  },
  // repair ramparts --and-walls--
  {
    structure: STRUCTURE_RAMPART,
    hits: RAMPART_HITS_MAX[8],
    from: findStorageAndTerminal,
    minimalStore: 100000,
    minimalStoreToSpawn: 120000,
    orderByHits: true,
  },
  // repair all roads
  {
    structure: STRUCTURE_ROAD,
    hits: ROAD_HITS - 1000,
    from: findStorageAndTerminal,
    minimalStore: 1000,
    minimalStoreToSpawn: Infinity,
  },
].map((opt) => new RepairRoute(opt))
