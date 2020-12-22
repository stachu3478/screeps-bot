import { SUCCESS, NOTHING_TODO, DONE } from '../constants/response'
import move from 'utils/path'
import { keepJournal } from './arrive/journal'
import { ensureEmpty } from 'role/creep/shared'

export interface ArriveCreep extends Creep {
  memory: ArriveMemory
}

export interface ArriveMemory extends CreepMemory {
  _arrive?: string
  _journal?: string[]
}

export default function arrive(
  creep: ArriveCreep,
  dumpCarry: boolean = true,
  journal: boolean = false,
) {
  if (dumpCarry && creep.store.getUsedCapacity() > 0) {
    ensureEmpty(creep)
  }
  if (journal) keepJournal(creep)
  const targetRoom = creep.memory._arrive
  if (!targetRoom) return NOTHING_TODO
  const pos = new RoomPosition(25, 25, targetRoom)
  let result = move.cheap(creep, pos, true, 25)
  if (result === ERR_NO_PATH)
    result = move.anywhere(creep, creep.pos.getDirectionTo(pos))
      ? OK
      : ERR_NO_PATH
  if (creep.room.name === targetRoom && result === 0) {
    delete creep.memory._arrive
    return DONE
  }
  return SUCCESS
}
