import _ from 'lodash'
import { Fighter } from "role/creep/fighter";
import { getContainer, getExtension, getSpawn } from './selectFromPos';

function persistFilter<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(v => v) as T[]
}

const towerFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_TOWER }
export const findTowers = (room: Room) => room.find<StructureTower>(FIND_STRUCTURES, towerFilter)

export const findContainers = (room: Room) => {
  const colonySources = room.memory.colonySources
  if (!colonySources) return []
  const potencialContainers = Object
    .values(colonySources)
    .map(char => getContainer(room, char.charCodeAt(0)))
  return persistFilter(potencialContainers)
}

const sourceKeepersFilter = { filter: (c: Creep) => c.owner.username === "Source Keeper" }
export const findSourceKeepers = (room: Room) => room.find(FIND_HOSTILE_CREEPS, sourceKeepersFilter)

const fighterFilter = { filter: (c: Creep) => c.memory.role === Role.FIGHTER }
export const findFighters = (room: Room) => room.find(FIND_MY_CREEPS, fighterFilter) as Fighter[]

const damagedCreepsFilter = { filter: (c: Creep) => c.hits < c.hitsMax }
export const findDamagedCreeps = (room: Room) => room.find(FIND_MY_CREEPS, damagedCreepsFilter)
export const findClosestDamagedCreeps = (pos: RoomPosition) => pos.findClosestByPath(FIND_MY_CREEPS, damagedCreepsFilter)

const lookResultDeobfuscator = ({ structure }: LookForAtAreaResultWithPos<Structure, LOOK_STRUCTURES>) => structure

const droppedEnergyFilter = { filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY }
export const findNearDroppedEnergy = (pos: RoomPosition) => pos.findInRange(FIND_DROPPED_RESOURCES, 1, droppedEnergyFilter)
export const getDroppedResource = (pos: RoomPosition) => pos.findClosestByPath(FIND_DROPPED_RESOURCES) || pos.findClosestByRange(FIND_DROPPED_RESOURCES)

const filledFilter = (s: Ruin | Tombstone) => s.store.getUsedCapacity() > 0
export const findHaulable = (room: Room, pos: RoomPosition) => {
  let potential: (Ruin | Tombstone)[] = room.find(FIND_TOMBSTONES)
  potential = potential.concat(room.find(FIND_RUINS))
  potential = potential.filter(filledFilter)
  return pos.findClosestByPath(potential) || pos.findClosestByRange(potential)
}

const energyFilter = { filter: (r: Tombstone | Ruin) => r.store[RESOURCE_ENERGY] }
export const findNearEnergyTombstones = (pos: RoomPosition) => pos.findInRange(FIND_TOMBSTONES, 1, energyFilter)
export const findNearEnergyRuins = (pos: RoomPosition) => pos.findInRange(FIND_RUINS, 1, energyFilter)

const filledContainerFilter = (s: AnyStoreStructure) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY]
export const findClosestFilledContainer = (pos: RoomPosition) => pos.findClosestByRange(
  findContainers(Game.rooms[pos.roomName])
    .filter(filledContainerFilter)
)

const hittableFilter = { filter: (s: Structure) => s.hits }
export const findClosestHostileHittableStructures = (pos: RoomPosition) => pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, hittableFilter)

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
const damagedFilter = (threshold: number) => (structure: Structure) => structure.hits && structure.hits + threshold <= structure.hitsMax
const damagePrioritySelector = (selected: Structure<BuildableStructureConstant>, current: Structure<BuildableStructureConstant>) => {
  const currentPriority = repairPriority[current.structureType]
  const selectedPriority = repairPriority[selected.structureType]
  if (currentPriority > selectedPriority) return current
  else if (currentPriority === selectedPriority) {
    if (current.hits < selected.hits) return current
    return selected
  }
  return selected
}
export const findCloseMostDamagedStructure = (pos: RoomPosition, threshold: number) => {
  const structures = pos.findInRange<Structure<BuildableStructureConstant>>(FIND_STRUCTURES, 3).filter(damagedFilter(threshold))
  if (!structures.length) return null
  return structures.reduce(damagePrioritySelector, structures[0])
}

interface ToFill {
  [key: string]: number
}
const fillPriority: ToFill = {
  [STRUCTURE_TOWER]: 11,
  [STRUCTURE_SPAWN]: 10,
  [STRUCTURE_EXTENSION]: 9,
  [STRUCTURE_LAB]: 8,
  [STRUCTURE_NUKER]: 7,
  [STRUCTURE_POWER_SPAWN]: 6,
  [STRUCTURE_LINK]: 5,
  [STRUCTURE_STORAGE]: 4,
  [STRUCTURE_TERMINAL]: 3,
  [STRUCTURE_FACTORY]: 2,
  [STRUCTURE_CONTAINER]: 1,
}

const toFillFilter = (differ?: AnyStoreStructure) => (structure: Structure) => {
  return fillPriority[structure.structureType]
    && (structure as AnyStoreStructure).store
    && structure !== differ
    && (((structure as AnyStoreStructure).store as StoreBase<ResourceConstant, false>).getFreeCapacity(RESOURCE_ENERGY) || 0) > 0
}
const toFillPrioritySelector = (s: AnyStoreStructure) => fillPriority[s.structureType] || 0
export const findNearStructureToFillWithPriority = (room: Room, x: number, y: number) => _.max(
  room.lookForAtArea(LOOK_STRUCTURES, y - 1, x - 1, y + 1, x + 1, true)
    .map(lookResultDeobfuscator)
    .filter(toFillFilter()),
  toFillPrioritySelector
) as AnyStoreStructure

const priorityObfuscator = (s: AnyStoreStructure) => fillPriority[s.structureType]
const priorityLimiter = (s: AnyStoreStructure) => fillPriority[s.structureType] > 5
export const findClosestStructureToFillWithPriority = (room: Room, pos: RoomPosition, differ?: AnyStoreStructure) => {
  const structures = room.find<AnyStoreStructure>(FIND_STRUCTURES)
    .filter(priorityLimiter)
    .filter(toFillFilter(differ))
  if (!structures.length) return null
  const maxPriority = fillPriority[_.max(structures, priorityObfuscator).structureType]
  const prioritized = structures.filter((s) => fillPriority[s.structureType] === maxPriority)
  return pos.findClosestByPath(prioritized) || pos.findClosestByRange(prioritized)
}

export const getDistanceOrderedHatches = (room: Room, energyNeeded: number) => {
  const structChars = room.memory.structs
  if (!structChars) return []
  const hatches: (StructureSpawn | StructureExtension)[] = []
  structChars
    .split('')
    .forEach(char => {
      const code = char.charCodeAt(0)
      const hatch = getExtension(room, code) || getSpawn(room, code)
      if (hatch) hatches.push(hatch)
    })
  let energyStored = 0
  const cutIndex = hatches.findIndex(obj => (energyStored += obj.store[RESOURCE_ENERGY]) >= energyNeeded)
  return hatches.slice(0, cutIndex + 1) // dunno
}
