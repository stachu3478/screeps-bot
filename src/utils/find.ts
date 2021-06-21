import energyDistribution from 'config/energyDistribution'
import { CREEP_RANGE, SOURCE_KEEPER_USERNAME } from 'constants/support'
import _ from 'lodash'
import { Fighter } from 'role/creep/military/fighter'

function persistFilter<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((v) => v) as T[]
}

export const findContainers = (room: Room) => {
  const potencialContainers = room.sources.positions.map((pos) =>
    pos.building(STRUCTURE_CONTAINER),
  )
  return persistFilter(potencialContainers) as StructureContainer[]
}

const sourceKeepersFilter = {
  filter: (c: Creep) => c.owner.username === SOURCE_KEEPER_USERNAME,
}
export const findSourceKeepers = (room: Room) =>
  room.find(FIND_HOSTILE_CREEPS, sourceKeepersFilter)

const fighterFilter = { filter: (c: Creep) => c.memory.role === Role.FIGHTER }
export const findFighters = (room: Room) =>
  room.find(FIND_MY_CREEPS, fighterFilter) as Fighter[]

const damagedCreepsFilter = { filter: (c: Creep) => c.hits < c.hitsMax }
export const findDamagedCreeps = (room: Room) =>
  room.find(FIND_MY_CREEPS, damagedCreepsFilter)
export const findClosestDamagedCreeps = (pos: RoomPosition) =>
  pos.findClosestByPath(FIND_MY_CREEPS, damagedCreepsFilter)

const droppedResourceFilter = (type: ResourceConstant) => (r: Resource) =>
  r.resourceType === type
export const findNearDroppedResource = (
  pos: RoomPosition,
  type: ResourceConstant,
) =>
  pos.findInRange(FIND_DROPPED_RESOURCES, 1).find(droppedResourceFilter(type))
export const getDroppedResource = (pos: RoomPosition) =>
  pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
    filter: (r) => r.amount > 50,
  }) ||
  pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    filter: (r) => r.amount > 50,
  })

const filledFilter = (s: Ruin | Tombstone | StructureContainer) =>
  s.store.getUsedCapacity() > 0
export const findHaulable = (room: Room, pos: RoomPosition) => {
  let potential: (Ruin | Tombstone | StructureContainer)[] = room.find(
    FIND_TOMBSTONES,
  )
  potential = potential.concat(room.find(FIND_RUINS))
  potential = potential.concat(
    room.buildings.containers.filter(
      (s) => !s.store[RESOURCE_ENERGY] || !room.my,
    ),
  )
  potential = potential.filter(filledFilter)
  return pos.findClosestByPath(potential) || pos.findClosestByRange(potential)
}

const resourceFilter = (type: ResourceConstant) => (r: Tombstone | Ruin) =>
  r.store[type] > 0
export const findNearTombstone = (pos: RoomPosition, type: ResourceConstant) =>
  pos.findInRange(FIND_TOMBSTONES, 1).find(resourceFilter(type))
export const findNearRuin = (pos: RoomPosition, type: ResourceConstant) =>
  pos.findInRange(FIND_RUINS, 1).find(resourceFilter(type))

const filledContainerFilter = (s: AnyStoreStructure) =>
  s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY]
export const findClosestFilledContainer = (pos: RoomPosition) =>
  pos.findClosestByRange(
    findContainers(Game.rooms[pos.roomName]).filter(filledContainerFilter),
  )

interface ObjectNumber {
  [key: string]: number
}
const repairPriority: ObjectNumber = {
  [STRUCTURE_SPAWN]: 100,
  [STRUCTURE_TOWER]: 99,
  [STRUCTURE_EXTENSION]: 98,
  [STRUCTURE_STORAGE]: 97,
  [STRUCTURE_TERMINAL]: 96,
  [STRUCTURE_FACTORY]: 95,
  [STRUCTURE_LINK]: 95,
  [STRUCTURE_OBSERVER]: 94,
  [STRUCTURE_POWER_SPAWN]: 93,
  [STRUCTURE_EXTRACTOR]: 92,
  [STRUCTURE_LAB]: 91,
  [STRUCTURE_NUKER]: 90,
  [STRUCTURE_CONTAINER]: 50,
  [STRUCTURE_ROAD]: 49,
  [STRUCTURE_RAMPART]: 48,
  [STRUCTURE_WALL]: 47,
}
const damagedFilter = (threshold: number) => (structure: Structure) =>
  structure.hits && structure.hits + threshold <= structure.hitsMax
const damagePrioritySelector = (
  selected: Structure<BuildableStructureConstant>,
  current: Structure<BuildableStructureConstant>,
) => {
  const currentPriority = repairPriority[current.structureType]
  const selectedPriority = repairPriority[selected.structureType]
  if (currentPriority > selectedPriority) return current
  else if (currentPriority === selectedPriority) {
    if (current.hits < selected.hits) return current
    return selected
  }
  return selected
}
export const findCloseMostDamagedStructure = (
  pos: RoomPosition,
  threshold: number,
) => {
  const structures = pos
    .findInRange<Structure<BuildableStructureConstant>>(
      FIND_STRUCTURES,
      CREEP_RANGE,
    )
    .filter(damagedFilter(threshold))
  if (!structures.length) return null
  return structures.reduce(damagePrioritySelector, structures[0])
}

interface ToFill {
  [key: string]: number
}
const fillPriority: ToFill = _.invert(energyDistribution)
export const findNearStructureToFillWithPriority = (creep: Creep) => {
  const structures = creep.pos
    .lookForAtInRange(LOOK_STRUCTURES, 1)
    .filter((s) => (s.structure as AnyStoreStructure).store)
    .sort(
      (a, b) =>
        fillPriority[a.structure.structureType] -
        fillPriority[b.structure.structureType],
    )
  return structures.find((s) => {
    return creep.transfer(s.structure, RESOURCE_ENERGY) === OK
  })?.structure as AnyStoreStructure | undefined
}
