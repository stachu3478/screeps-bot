import { SUCCESS, NOTHING_TODO, DONE } from '../constants/response'
import { cheapMove, moveAnywhere } from 'utils/path';

interface ArriveCreep extends Creep {
  memory: ArriveMemory
}

interface ArriveMemory extends CreepMemory {
  _arrive?: string
}

export default function arrive(creep: ArriveCreep, dumpCarry: boolean = true) {
  if (dumpCarry && creep.store.getUsedCapacity() > 0) {
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
  if (result === ERR_NO_PATH) moveAnywhere(creep, creep.pos.getDirectionTo(pos))
  if (creep.room.name === targetRoom && result === 0) {
    delete creep.memory._arrive
    return DONE
  }
  return SUCCESS
}
