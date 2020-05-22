import _ from 'lodash'
import { FIGHTER } from "constants/role";
import { Fighter } from "role/fighter";

const extractorFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_EXTRACTOR }
export const findExtractors = (room: Room) => room.find<StructureExtractor>(FIND_STRUCTURES, extractorFilter)

const towerFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_TOWER }
export const findTowers = (room: Room) => room.find<StructureTower>(FIND_STRUCTURES, towerFilter)

const containerFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_CONTAINER }
export const findContainers = (room: Room) => room.find<StructureContainer>(FIND_STRUCTURES, containerFilter)

const linkFilter = { filter: (s: Structure) => s.structureType === STRUCTURE_LINK }
export const findLinks = (room: Room) => room.find<StructureLink>(FIND_STRUCTURES, linkFilter)

const sourceKeepersFilter = { filter: (c: Creep) => c.owner.username === "Source Keeper" }
export const findSourceKeepers = (room: Room) => room.find(FIND_HOSTILE_CREEPS, sourceKeepersFilter)

const fighterFilter = { filter: (c: Creep) => c.memory.role === FIGHTER }
export const findFighters = (room: Room) => room.find(FIND_MY_CREEPS, fighterFilter) as Fighter[]

const damagedCreepsFilter = { filter: (c: Creep) => c.hits < c.hitsMax }
export const findDamagedCreeps = (room: Room) => room.find(FIND_MY_CREEPS, damagedCreepsFilter)
export const findClosestDamagedCreeps = (pos: RoomPosition) => pos.findClosestByPath(FIND_MY_CREEPS, damagedCreepsFilter)

const lookResultDeobfuscator = ({ structure }: LookForAtAreaResultWithPos<Structure, LOOK_STRUCTURES>) => structure

const droppedEnergyFilter = { filter: (r: Resource) => r.resourceType === RESOURCE_ENERGY }
export const findNearDroppedEnergy = (pos: RoomPosition) => pos.findInRange(FIND_DROPPED_RESOURCES, 1, droppedEnergyFilter)

const tombstoneEnergyFilter = { filter: (r: Tombstone) => r.store[RESOURCE_ENERGY] }
export const findNearEnergyTombstones = (pos: RoomPosition) => pos.findInRange(FIND_TOMBSTONES, 1, tombstoneEnergyFilter)

const ruinEnergyFilter = { filter: (r: Ruin) => r.store[RESOURCE_ENERGY] }
export const findNearEnergyRuins = (pos: RoomPosition) => pos.findInRange(FIND_RUINS, 1, ruinEnergyFilter)

const filledContainerFilter = { filter: (s: AnyStoreStructure) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] }
export const findClosestFilledContainer = (pos: RoomPosition) => pos.findClosestByRange<StructureContainer>(FIND_STRUCTURES, filledContainerFilter)

const hittableFilter = { filter: (s: Structure) => s.hits }
export const findClosestHostileHittableStructures = (pos: RoomPosition) => pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, hittableFilter)

const standardHatchFilter = {
  filter: (s: AnyStoreStructure) => (s.structureType === STRUCTURE_SPAWN
    || s.structureType === STRUCTURE_EXTENSION)
    && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
}
const fillableHatchFilter = (differ?: AnyStoreStructure) => (
  differ ? {
    filter: (s: AnyStoreStructure) =>
      s !== differ
      && (s.structureType === STRUCTURE_SPAWN
        || s.structureType === STRUCTURE_EXTENSION)
      && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  } : standardHatchFilter
)
export const findClosestHatchToFill = (pos: RoomPosition, differ?: AnyStoreStructure) => (pos.findClosestByPath(FIND_MY_STRUCTURES, fillableHatchFilter(differ)) || pos.findClosestByRange(FIND_MY_STRUCTURES, fillableHatchFilter(differ))) as StructureSpawn | StructureExtension | null

const fillableTowerFilter = {
  filter: (s: AnyStoreStructure) => (s.structureType === STRUCTURE_TOWER)
    && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
}
const towerEmtinessRank = (t: StructureTower) => t.store[RESOURCE_ENERGY]
export const findMostEmptiedTower = (room: Room) => _.min(room.find<StructureTower>(FIND_MY_STRUCTURES, fillableTowerFilter), towerEmtinessRank) as StructureTower | number

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
  [STRUCTURE_LINK]: 6,
  [STRUCTURE_STORAGE]: 5,
  [STRUCTURE_TERMINAL]: 4,
  [STRUCTURE_POWER_SPAWN]: 3,
  [STRUCTURE_FACTORY]: 2,
  [STRUCTURE_CONTAINER]: 1,
}
const toFillFilter = (s: LookForAtAreaResultWithPos<Structure, LOOK_STRUCTURES>) => {
  const { structure } = s
  return fillPriority[structure.structureType]
    && (structure as AnyStoreStructure).store
    && (((structure as AnyStoreStructure).store as StoreBase<ResourceConstant, false>).getFreeCapacity(RESOURCE_ENERGY) || 0) > 0
}
const toFillPrioritySelector = (s: AnyStoreStructure) => fillPriority[s.structureType] || 0
export const findNearStructureToFillWithPriority = (room: Room, x: number, y: number) => _.max(
  room.lookForAtArea(LOOK_STRUCTURES, y - 1, x - 1, y + 1, x + 1, true)
    .filter(toFillFilter).map(lookResultDeobfuscator),
  toFillPrioritySelector
) as AnyStoreStructure
