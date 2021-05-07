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
const storageOrTerminal: Record<string, number> = {
  [STRUCTURE_STORAGE]: 1,
  [STRUCTURE_TERMINAL]: 1,
}
const storageOrTerminalFilter = (s: Structure) =>
  storageOrTerminal[s.structureType]
export default [
  // most important spawn
  {
    structure: STRUCTURE_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 1, 1),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageTerminalOrContainerFilter) as AnyStoreStructure[],
  },
  // mostly important defense
  {
    structure: STRUCTURE_TOWER,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 5, 6),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageTerminalOrContainerFilter) as AnyStoreStructure[],
  },
  // protect your base
  {
    structure: STRUCTURE_RAMPART,
    positions: (room: Room) => room.shieldPositions,
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageTerminalOrContainerFilter) as AnyStoreStructure[],
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
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageTerminalOrContainerFilter) as AnyStoreStructure[],
  },
  // extend spawn
  {
    structure: STRUCTURE_EXTENSION,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 15),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageTerminalOrContainerFilter) as AnyStoreStructure[],
  },
  // roads for fast moving
  {
    structure: STRUCTURE_ROAD,
    positions: (room: Room) => charToPositionMapper(room, room.memory.roads),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageTerminalOrContainerFilter) as AnyStoreStructure[],
    //if: (room: Room) => (room.cache.roadBuilt || 0) > Game.time
  },
  // other useful buildings
  {
    structure: STRUCTURE_TERMINAL,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 3, 1),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageOrTerminalFilter) as AnyStoreStructure[],
  },
  {
    structure: STRUCTURE_EXTRACTOR,
    positions: (room: Room) => (room.mineral ? [room.mineral.pos] : []),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageOrTerminalFilter) as AnyStoreStructure[],
  },
  {
    structure: STRUCTURE_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 13, 2),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageOrTerminalFilter) as AnyStoreStructure[],
  },
  {
    structure: STRUCTURE_FACTORY,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 4, 1),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageOrTerminalFilter) as AnyStoreStructure[],
  },
  /*{ // todo funciton returning lab positions clearly & check integrity after planning lab
    structure: STRUCTURE_LAB,
    positions: (room: Room) => charToPositionMapper(room, room.memory.structs, 4, 1)
  },*/
  {
    structure: STRUCTURE_POWER_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 11, 1),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageOrTerminalFilter) as AnyStoreStructure[],
  },
  {
    structure: STRUCTURE_NUKER,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 12, 1),
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageOrTerminalFilter) as AnyStoreStructure[],
  },
  {
    structure: STRUCTURE_OBSERVER,
    positions: (room: Room) => [room.leastAvailablePosition],
    from: (room: Room) =>
      room
        .find(FIND_STRUCTURES)
        .filter(storageOrTerminalFilter) as AnyStoreStructure[],
  },
].map((options) => new BuildingRoute(options))
