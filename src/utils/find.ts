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

const filledContainerFilter = { filter: (s: AnyStoreStructure) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] }
export const findClosestFilledContainer = (pos: RoomPosition) => pos.findClosestByRange(FIND_STRUCTURES, filledContainerFilter) as StructureContainer | undefined

const hittableFilter = { filter: (s: Creep | Structure) => s.hits }
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
