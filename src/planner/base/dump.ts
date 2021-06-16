import { getMaximumWorkPartsForSource, getWorkSaturation } from '../opts'
import { posToChar } from '../pos'

export default function dump(
  room: Room,
  sourcePositions: string[],
  farSourceId: number,
  nearSourceId: number,
  genericStructurePositions: RoomPosition[],
  linkPositions: RoomPosition[],
  roadPositions: RoomPosition[],
  controllerLinkPosition: RoomPosition,
) {
  // dump data to Memory
  const memory = room.memory
  memory.controllerLink = posToChar(controllerLinkPosition)
  memory.structs = genericStructurePositions
    .map((pos) => posToChar(pos))
    .join('')
  memory.roads = roadPositions.map((pos) => posToChar(pos)).join('')
  memory[RoomMemoryKeys.sourceInfo] = sourcePositions
  memory[RoomMemoryKeys.colonySourceIndex] = farSourceId
  memory.maxWorkController = Math.ceil(
    getMaximumWorkPartsForSource(
      getWorkSaturation(50, 2 * sourcePositions[nearSourceId].charCodeAt(1)),
    ),
  )
  memory.links = linkPositions.map((pos) => posToChar(pos)).join('')
  delete memory.externalLabs
  delete memory.internalLabs
  delete memory[RoomMemoryKeys.shields]
}
