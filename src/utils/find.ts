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
