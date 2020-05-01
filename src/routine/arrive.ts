import { SUCCESS, NOTHING_TODO, DONE } from '../constants/response'
import { cheapMove } from 'utils/path';

export default function arrive(creep: Creep) {
  if (creep.store.getUsedCapacity() > 0) {
    const resourceCount = RESOURCES_ALL.length
    for (let i = 0; i < resourceCount; i++) {
      const r = RESOURCES_ALL[i]
      if (creep.store[r]) {
        creep.drop(r)
        break
      }
    }
  }

  const targetRoom = creep.memory._arrive
  if (!targetRoom) return NOTHING_TODO
  const pos = new RoomPosition(25, 25, targetRoom)
  cheapMove(creep, pos)
  if (creep.room.name === targetRoom) {
    delete creep.memory._harvest
    delete creep.memory._fill
    delete creep.memory._build // fresh
    delete creep.memory._arrive
    return DONE
  }
  return SUCCESS
}
