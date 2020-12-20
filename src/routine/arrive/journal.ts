import { ArriveCreep } from '../arrive'
import move from 'utils/path'

function roomLocationIndex(roomName: string) {
  let [, w, x, h, y] = roomName.split(/(W|E|N|S)/)
  let xPos = parseInt(x)
  let yPos = parseInt(y)
  if (w === 'W') xPos = -xPos
  if (h === 'S') yPos = -yPos
  return [xPos, yPos]
}

function getExitDirection(roomNameFrom: string, roomNameTo: string) {
  const [x1, y1] = roomLocationIndex(roomNameFrom)
  const [x2, y2] = roomLocationIndex(roomNameTo)
  if (x2 < x1) return FIND_EXIT_LEFT
  if (x1 < x2) return FIND_EXIT_RIGHT
  if (y1 < y2) return FIND_EXIT_TOP
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
