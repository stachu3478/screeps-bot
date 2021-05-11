import { findStorageAndTerminal } from './buildingRoutes'
import RepairRoute from 'job/repairRoute/RepairRoute'

const fortificationsAndRoads: Record<string, 1 | undefined> = {
  [STRUCTURE_RAMPART]: 1,
  [STRUCTURE_ROAD]: 1,
  [STRUCTURE_WALL]: 1,
  [STRUCTURE_CONTAINER]: 1,
}
const fortifications: Record<string, 1 | undefined> = {
  [STRUCTURE_RAMPART]: 1,
  [STRUCTURE_WALL]: 1,
}
const findAllOther = (room: Room) =>
  room
    .find(FIND_STRUCTURES)
    .filter((s) => !fortificationsAndRoads[s.structureType]) as Structure<
    BuildableStructureConstant
  >[]
const findFortifications = (room: Room) =>
  room
    .find(FIND_STRUCTURES)
    .filter((s) => !!fortifications[s.structureType]) as Structure<
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
  // repair ramparts and walls
  {
    structure: findFortifications,
    hits: RAMPART_HITS_MAX[8],
    from: findStorageAndTerminal,
    minimalStore: 100000,
    //orderByHits: true
  },
].map((opt) => new RepairRoute(opt))
