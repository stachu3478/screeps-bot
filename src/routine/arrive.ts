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
  const result = cheapMove(creep, pos, true)
  if (result === ERR_NO_PATH) creep.move(creep.pos.getDirectionTo(25, 25))
  if (creep.room.name === targetRoom && result === 0) {
    delete creep.memory._harvest
    delete creep.memory._fill
    delete creep.memory._build // fresh
    delete creep.memory._arrive
    delete creep.memory._attack
    return DONE
  }
  return SUCCESS
}
