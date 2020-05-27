import plan from '../core'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE } from '../../constants/response'
import planLabs from '../planLabs';
import placeLink from './link';
import placeStructure from './structure';
import placeExtractor from './extractor';
import placeLab from './lab';
import placeRoad from './road';
import placeShield from './shield';
import checkIntegrity from './checkIntegrity';

export default function place(room: Room) {
  const controller = room.controller
  if (!controller) return NOTHING_TODO
  const mem = room.memory
  if (!mem._built) {
    if (!mem.structs) {
      plan(room)
      return NOTHING_DONE
    }
    if (placeStructure(controller, mem.structs) === SUCCESS) return SUCCESS
    if (placeExtractor(controller) === SUCCESS) return SUCCESS
    if (placeLink(room)) return SUCCESS
    if (!mem.internalLabs || !mem.externalLabs) {
      planLabs.run(room)
      return NOTHING_DONE
    }
    if (placeLab(room, mem.internalLabs + mem.externalLabs) === SUCCESS) return SUCCESS

    const newStructs = checkIntegrity(mem.structs, mem.internalLabs + mem.externalLabs)
    if (newStructs !== mem.structs) {
      mem.structs = newStructs
      return NOTHING_DONE
    }
    mem._built = true
  }

  if (!mem.roads) {
    plan(room)
    return NOTHING_DONE
  }
  if (placeRoad(room, mem.roads) === SUCCESS) return SUCCESS

  if (placeShield(controller) === SUCCESS) return SUCCESS

  return NOTHING_TODO
}
