import _ from 'lodash'

const createPosSelector = (type: StructureConstant) => (room: Room, charCode: number) =>
  _.find(room.lookForAt(LOOK_STRUCTURES, charCode & 63, charCode >> 6), s => s.structureType === type)

const createXYSelector = (type: StructureConstant) => (room: Room, x: number, y: number) =>
  _.find(room.lookForAt(LOOK_STRUCTURES, x, y), s => s.structureType === type)

export const getLink = createPosSelector(STRUCTURE_LINK) as (room: Room, charCode: number) => StructureLink | undefined
export const getFactory = createPosSelector(STRUCTURE_FACTORY) as (room: Room, charCode: number) => StructureFactory | undefined
export const getLab = createPosSelector(STRUCTURE_LAB) as (room: Room, charCode: number) => StructureLab | undefined

export const getXYLink = createXYSelector(STRUCTURE_LINK) as (room: Room, x: number, y: number) => StructureLink | undefined
export const getXYContainer = createXYSelector(STRUCTURE_CONTAINER) as (room: Room, x: number, y: number) => StructureContainer | undefined
export const getXYSpawn = createXYSelector(STRUCTURE_SPAWN) as (room: Room, x: number, y: number) => StructureSpawn | undefined
export const getXYTower = createXYSelector(STRUCTURE_TOWER) as (room: Room, x: number, y: number) => StructureTower | undefined
export const getXYRampart = createXYSelector(STRUCTURE_RAMPART) as (room: Room, x: number, y: number) => StructureRampart | undefined
export const getXYWall = createXYSelector(STRUCTURE_WALL) as (room: Room, x: number, y: number) => StructureWall | undefined
export const getXYLab = createXYSelector(STRUCTURE_LAB) as (room: Room, x: number, y: number) => StructureLab | undefined
export const getXYRoad = createXYSelector(STRUCTURE_ROAD) as (room: Room, x: number, y: number) => StructureRoad | undefined
export const getXYExtractor = createXYSelector(STRUCTURE_EXTRACTOR) as (room: Room, x: number, y: number) => StructureExtractor | undefined
