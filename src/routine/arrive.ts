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
  const memory = creep.memory
  const targetRoom = memory._arrive
  console.log(targetRoom)
  if (!targetRoom) return NOTHING_TODO
  const nextRoom = creep.motherRoom.location.findRoomPathStep(
    creep.room.name,
    targetRoom,
  )
  console.log(JSON.stringify(nextRoom))
  if (!nextRoom) return NOTHING_TODO
  const pos = new RoomPosition(nextRoom.x, nextRoom.y, nextRoom.name)
  let result = move.cheap(creep, pos, true)
  console.log(result)
  if (creep.room.name === targetRoom && result === 0) {
    delete creep.memory._arrive
    return DONE
  }
  return SUCCESS
}
