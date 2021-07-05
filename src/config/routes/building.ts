import _ from 'lodash'
import BuildingRoute from 'job/buildingRoute/BuildingRoute'
import checkIntegrity from 'planner/place/checkIntegrity'

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

const findStorageTerminalAndContainers = (room: Room) =>
  room.buildings.get(STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_CONTAINER)
export const findStorageAndTerminal = (room: Room) =>
  room.buildings.get(STRUCTURE_STORAGE, STRUCTURE_TERMINAL)
const exclusive = (structure: Structure) =>
  structure.structureType !== STRUCTURE_RAMPART &&
  (structure.structureType !== STRUCTURE_SPAWN ||
    structure.room.buildings.spawns.length > 1) &&
  (structure.structureType !== STRUCTURE_STORAGE ||
    !!structure.room.terminal) &&
  (structure.structureType !== STRUCTURE_TERMINAL || !!structure.room.storage)
export default [
  // most important spawn
  {
    structure: STRUCTURE_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 1, 1),
    from: findStorageTerminalAndContainers,
    exclusive,
  },
  // mostly important defense
  {
    structure: STRUCTURE_TOWER,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 5, 6),
    from: findStorageTerminalAndContainers,
    exclusive,
  },
  // protect your base
  {
    structure: STRUCTURE_RAMPART,
    positions: (room: Room) => room.positions.forShield,
    from: findStorageTerminalAndContainers,
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
    exclusive,
  },
  // extend spawn
  {
    structure: STRUCTURE_EXTENSION,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 15),
    from: findStorageTerminalAndContainers,
    exclusive,
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
        ...room.buildings.roads.map((r) => r.vaporTime),
        1500,
      )),
    exclusive,
  },
  // other useful buildings
  {
    structure: STRUCTURE_TERMINAL,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 3, 1),
    from: findStorageAndTerminal,
    exclusive,
  },
  {
    structure: STRUCTURE_LINK,
    positions: (room: Room) => {
      let links = room.memory.links || ''
      links += room.memory.structs ? room.memory.structs[0] : ''
      links += room.memory.controllerLink || ''
      return charToPositionMapper(room, links)
    },
    from: findStorageAndTerminal,
    exclusive,
  },
  {
    structure: STRUCTURE_EXTRACTOR,
    positions: (room: Room) => (room.mineral ? [room.mineral.pos] : []),
    from: findStorageAndTerminal,
    exclusive,
  },
  {
    structure: STRUCTURE_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 13, 2),
    from: findStorageAndTerminal,
    exclusive,
  },
  {
    structure: STRUCTURE_FACTORY,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 4, 1),
    from: findStorageAndTerminal,
    exclusive,
  },
  {
    structure: STRUCTURE_LAB,
    positions: (room: Room) => room.positions.forLabs,
    from: findStorageAndTerminal,
    exclusive,
    done: (room: Room) => {
      room.memory.structs = checkIntegrity(
        room.memory.structs || '',
        (room.memory.internalLabs || '') + (room.memory.externalLabs || ''),
      )
    },
  },
  {
    structure: STRUCTURE_POWER_SPAWN,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 11, 1),
    from: findStorageAndTerminal,
    exclusive,
  },
  {
    structure: STRUCTURE_NUKER,
    positions: (room: Room) =>
      charToPositionMapper(room, room.memory.structs, 12, 1),
    from: findStorageAndTerminal,
    exclusive,
  },
  {
    structure: STRUCTURE_OBSERVER,
    positions: (room: Room) => [room.positions.leastAvailable],
    from: findStorageAndTerminal,
    exclusive,
  },
].map((options) => new BuildingRoute(options))
