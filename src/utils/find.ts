import _ from 'lodash'
import { FIGHTER } from "constants/role";
import { Fighter } from "role/fighter";

const extractorFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_EXTRACTOR }
export const findExtractors = (room: Room) => room.find(FIND_STRUCTURES, extractorFilter) as StructureExtractor[]

const towerFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_TOWER }
export const findTowers = (room: Room) => room.find(FIND_STRUCTURES, towerFilter) as StructureTower[]

const containerFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER }
export const findContainers = (room: Room) => room.find(FIND_STRUCTURES, containerFilter) as StructureContainer[]

const linkFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_LINK }
export const findLinks = (room: Room) => room.find(FIND_STRUCTURES, linkFilter) as StructureLink[]

const sourceKeepersFilter = { filter: (c: Creep) => c.owner.username === "Source Keeper" }
export const findSourceKeepers = (room: Room) => room.find(FIND_HOSTILE_CREEPS, sourceKeepersFilter)

const fighterFilter = { filter: (c: Creep) => c.memory.role === FIGHTER }
export const findFighters = (room: Room) => room.find(FIND_MY_CREEPS, fighterFilter) as Fighter[]

const damagedCreepsFilter = { filter: (c: Creep) => c.hits < c.hitsMax }
export const findDamagedCreeps = (room: Room) => room.find(FIND_MY_CREEPS, damagedCreepsFilter)
export const findClosestDamagedCreeps = (pos: RoomPosition) => pos.findClosestByPath(FIND_MY_CREEPS, damagedCreepsFilter)

const droppedEnergyFilter = { filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY }
export const findNearDroppedEnergy = (pos: RoomPosition) => pos.findInRange(FIND_DROPPED_RESOURCES, 1, droppedEnergyFilter)

const tombstoneEnergyFilter = { filter: (r: Tombstone) => r.store[RESOURCE_ENERGY] }
export const findNearEnergyTombstones = (pos: RoomPosition) => pos.findInRange(FIND_TOMBSTONES, 1, tombstoneEnergyFilter)

const ruinEnergyFilter = { filter: (r: Ruin) => r.store[RESOURCE_ENERGY] }
export const findNearEnergyRuins = (pos: RoomPosition) => pos.findInRange(FIND_RUINS, 1, ruinEnergyFilter)

const filledContainerFilter = { filter: (s: AnyStoreStructure) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] }
export const findClosestFilledContainer = (pos: RoomPosition) => pos.findClosestByRange(FIND_STRUCTURES, filledContainerFilter) as StructureContainer | undefined

const hittableFilter = { filter: (s: Structure) => s.hits }
export const findClosestHostileHittableStructures = (pos: RoomPosition) => pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, hittableFilter)

const fillableHatchFilter = {
  filter: (s: AnyStoreStructure) => (s.structureType === STRUCTURE_SPAWN
    || s.structureType === STRUCTURE_EXTENSION)
    && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
}
export const findClosestHatchToFill = (pos: RoomPosition) => pos.findClosestByPath(FIND_MY_STRUCTURES, fillableHatchFilter) as StructureSpawn | StructureExtension | null

const fillableTowerFilter = {
  filter: (s: AnyStoreStructure) => (s.structureType === STRUCTURE_TOWER)
    && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
}
const towerEmtinessRank = (t: StructureTower) => t.store[RESOURCE_ENERGY]
export const findMostEmptiedTower = (room: Room) => _.min(room.find(FIND_MY_STRUCTURES, fillableTowerFilter), towerEmtinessRank) as StructureTower | number

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
  const structures = pos.findInRange(FIND_STRUCTURES, 3).filter(damagedFilter(threshold)) as Structure<BuildableStructureConstant>[]
  return structures.reduce(damagePrioritySelector, structures[0])
}
