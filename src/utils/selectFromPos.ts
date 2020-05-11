import _ from 'lodash'

const createPosSelector = (type: StructureConstant) => (pos: RoomPosition) =>
  _.find(pos.lookFor(LOOK_STRUCTURES), s => s.structureType === type)

const createXYSelector = (type: StructureConstant) => (room: Room, x: number, y: number) =>
  _.find(room.lookForAt(LOOK_STRUCTURES, x, y), s => s.structureType === type)

export const getLink = createPosSelector(STRUCTURE_LINK) as (pos: RoomPosition) => StructureLink | undefined
export const getContainer = createPosSelector(STRUCTURE_CONTAINER) as (pos: RoomPosition) => StructureContainer | undefined

export const getXYLink = createXYSelector(STRUCTURE_LINK) as (room: Room, x: number, y: number) => StructureLink | undefined
export const getXYContainer = createXYSelector(STRUCTURE_CONTAINER) as (room: Room, x: number, y: number) => StructureContainer | undefined
