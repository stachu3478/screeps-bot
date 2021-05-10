import _ from 'lodash'
import BuildingRoute from 'job/buildingRoute/BuildingRoute'

const charToPositionMapper = (
  room: Room,
  str: string = '',
  from: number = 0,
  count?: number,
) =>
  str
    .substr(from, count)
    .split('')
    .map((c) => room.positionFromChar(c))

const storageTerminalOrContainer: Record<string, number> = {
  [STRUCTURE_STORAGE]: 1,
  [STRUCTURE_TERMINAL]: 1,
  [STRUCTURE_CONTAINER]: 1,
}
const storageTerminalOrContainerFilter = (s: Structure) =>
  storageTerminalOrContainer[s.structureType]
const findStorageTerminalAndContainers = (room: Room) =>
  room
    .find(FIND_STRUCTURES)
    .filter(storageTerminalOrContainerFilter) as AnyStoreStructure[]
export const findStorageAndTerminal = (room: Room) => {
  const structures = []
  const storage = room.storage
  const terminal = room.terminal
  if (storage) structures.push(storage)
  if (terminal) structures.push(terminal)
  return structures
}
export default [
  // most important spawn
  {
    structure: STRUCTURE_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 1, 1),
    from: findStorageTerminalAndContainers,
  },
  // mostly important defense
  {
    structure: STRUCTURE_TOWER,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 5, 6),
    from: findStorageTerminalAndContainers,
  },
  // protect your base
  {
    structure: STRUCTURE_RAMPART,
    positions: (room: Room) => room.shieldPositions,
    from: findStorageTerminalAndContainers,
    //afterBuild: (creep: Creep, rampart: StructureRampart) => creep.repair(rampart)
  },
  /*{ // todo get wall positions
    structure: STRUCTURE_WALL,
    positions: (room: Room) => room.planner.wallPositions
  },*/
  // storage for energy
  {
    structure: STRUCTURE_STORAGE,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 2, 1),
    from: findStorageTerminalAndContainers,
  },
  // extend spawn
  {
    structure: STRUCTURE_EXTENSION,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 15),
    from: findStorageTerminalAndContainers,
  },
  // roads for fast moving
  {
    structure: STRUCTURE_ROAD,
    positions: (room: Room) => charToPositionMapper(room, room.memory.roads),
    from: findStorageTerminalAndContainers,
    // it is expensive, lets check that rarely
    if: (room: Room) => (room.cache.roadBuilt || 0) > Game.time,
    done: (room: Room) =>
      (room.cache.roadBuilt = Math.min(
        ...(room
          .find(FIND_STRUCTURES)
          .filter(
            (s) => s.structureType === STRUCTURE_ROAD,
          ) as StructureRoad[]).map(
          (r) =>
            Game.time +
            ROAD_DECAY_TIME * Math.floor(r.hits / ROAD_DECAY_AMOUNT) +
            r.ticksToDecay,
        ),
        1500,
      )),
  },
  // other useful buildings
  {
    structure: STRUCTURE_TERMINAL,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 3, 1),
    from: findStorageAndTerminal,
  },
  {
    structure: STRUCTURE_EXTRACTOR,
    positions: (room: Room) => (room.mineral ? [room.mineral.pos] : []),
    from: findStorageAndTerminal,
  },
  {
    structure: STRUCTURE_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 13, 2),
    from: findStorageAndTerminal,
  },
  {
    structure: STRUCTURE_FACTORY,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 4, 1),
    from: findStorageAndTerminal,
  },
  /*{ // todo funciton returning lab positions clearly & check integrity after planning lab
    structure: STRUCTURE_LAB,
    positions: (room: Room) => charToPositionMapper(room, room.memory.structs, 4, 1)
  },*/
  {
    structure: STRUCTURE_POWER_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 11, 1),
    from: findStorageAndTerminal,
  },
  {
    structure: STRUCTURE_NUKER,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 12, 1),
    from: findStorageAndTerminal,
  },
  {
    structure: STRUCTURE_OBSERVER,
    positions: (room: Room) => [room.leastAvailablePosition],
    from: findStorageAndTerminal,
  },
].map((options) => new BuildingRoute(options))
