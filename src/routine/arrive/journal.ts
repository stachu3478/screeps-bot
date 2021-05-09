import { ArriveCreep } from '../arrive'
import move from 'utils/path'
import RoomLocation from 'overloads/room/RoomLocation'

function getExitDirection(roomNameFrom: string, roomNameTo: string) {
  const roomFrom = new RoomLocation(roomNameFrom)
  const roomTo = new RoomLocation(roomNameTo)
  if (roomTo.x < roomFrom.x) return FIND_EXIT_LEFT
  if (roomFrom.x < roomTo.x) return FIND_EXIT_RIGHT
  if (roomFrom.y < roomTo.y) return FIND_EXIT_TOP
  return FIND_EXIT_BOTTOM
}

function getJournal(creep: ArriveCreep) {
  if (!creep.memory._journal) creep.memory._journal = []
  return creep.memory._journal
}

export function keepJournal(creep: ArriveCreep) {
  const journal = getJournal(creep)
  const lastEntry = journal[journal.length - 1]
  if (lastEntry !== creep.room.name) journal.push(creep.room.name)
}

export function followJournal(creep: ArriveCreep) {
  const journal = getJournal(creep)
  let lastEntry = journal[journal.length - 1]
  while (lastEntry === creep.room.name) {
    journal.pop()
    lastEntry = journal[journal.length - 1]
  }
  if (!journal.length) return false
  const exit = creep.pos.findClosestByRange(
    getExitDirection(creep.room.name, lastEntry),
  )
  if (exit) return move.cheap(creep, exit, true, 0) !== ERR_NO_PATH
  return false
}
