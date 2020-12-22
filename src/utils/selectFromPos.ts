type PosSelector<T> = (room: Room, charCode: number) => T | undefined
const createPosSelector = (type: StructureConstant) => (
  room: Room,
  charCode: number,
) =>
  room
    .lookForAt(LOOK_STRUCTURES, charCode & 63, charCode >> 6)
    .find((s) => s.structureType === type)

type XYSelector<T> = (room: Room, x: number, y: number) => T | undefined
const createXYSelector = (type: StructureConstant) => (
  room: Room,
  x: number,
  y: number,
) => room.lookForAt(LOOK_STRUCTURES, x, y).find((s) => s.structureType === type)

export const getLink = createPosSelector(STRUCTURE_LINK) as PosSelector<
  StructureLink
>
export const getFactory = createPosSelector(STRUCTURE_FACTORY) as PosSelector<
  StructureFactory
>
export const getLab = createPosSelector(STRUCTURE_LAB) as PosSelector<
  StructureLab
>
export const getContainer = createPosSelector(
  STRUCTURE_CONTAINER,
) as PosSelector<StructureContainer>
export const getExtension = createPosSelector(
  STRUCTURE_EXTENSION,
) as PosSelector<StructureExtension>
export const getSpawn = createPosSelector(STRUCTURE_SPAWN) as PosSelector<
  StructureSpawn
>
export const getPowerSpawn = createPosSelector(
  STRUCTURE_POWER_SPAWN,
) as PosSelector<StructurePowerSpawn>
export const getWall = createPosSelector(STRUCTURE_WALL) as PosSelector<
  StructureWall
>

export const getXYLink = createXYSelector(STRUCTURE_LINK) as XYSelector<
  StructureLink
>
export const getXYContainer = createXYSelector(
  STRUCTURE_CONTAINER,
) as XYSelector<StructureContainer>
export const getXYExtension = createXYSelector(
  STRUCTURE_EXTENSION,
) as XYSelector<StructureExtension>
export const getXYSpawn = createXYSelector(STRUCTURE_SPAWN) as XYSelector<
  StructureSpawn
>
export const getXYTower = createXYSelector(STRUCTURE_TOWER) as XYSelector<
  StructureTower
>
export const getXYRampart = createXYSelector(STRUCTURE_RAMPART) as XYSelector<
  StructureRampart
>
export const getXYWall = createXYSelector(STRUCTURE_WALL) as XYSelector<
  StructureWall
>
export const getXYRoad = createXYSelector(STRUCTURE_ROAD) as XYSelector<
  StructureRoad
>
export const getXYExtractor = createXYSelector(
  STRUCTURE_EXTRACTOR,
) as XYSelector<StructureExtractor>
