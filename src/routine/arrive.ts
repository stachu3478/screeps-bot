import { SUCCESS, NOTHING_TODO, DONE } from '../constants/response'
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
  target: string | undefined = creep.memory._arrive,
) {
  if (dumpCarry && creep.store.getUsedCapacity() > 0) {
    ensureEmpty(creep)
  }
  if (journal) keepJournal(creep)
  if (!target) return NOTHING_TODO
  const result = creep.moveToRoom(target)
  if (result === ERR_NOT_FOUND) return NOTHING_TODO
  if (creep.room.name === target && result === 0) {
    delete creep.memory._arrive
    return DONE
  }
  return SUCCESS
}
