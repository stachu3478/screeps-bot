import { DONE, NOTHING_TODO } from 'constants/response'
import arrive from 'routine/arrive'
import RoomEnemies from 'room/military/RoomEnemies'
import move from 'utils/path'

export interface Scout extends Creep {
  cache: ScoutCache
  memory: ScoutMemory
}

interface ScoutCache extends CreepCache {
  exit: string
}

interface ScoutMemory extends CreepMemory {
  _arrive?: string
}

export default function run(creep: Scout) {
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.SCOUT
      break
    case State.SCOUT:
      creep.memory._arrive = creep.motherRoom.pathScanner.scanTarget
      creep.motherRoom.cache.scoutsWorking++
      const hostiles = new RoomEnemies(creep.room).find()
      const hostileNotSafe = hostiles.find((h) => !creep.isSafeFrom(h))
      if (hostileNotSafe)
        move.anywhere(creep, hostileNotSafe.pos.getDirectionTo(creep))
      else
        switch (arrive(creep)) {
          case NOTHING_TODO:
          case DONE:
            creep.memory.state = State.IDLE
            break
        }
      break
    case State.IDLE:
      const target = creep.motherRoom.pathScanner.scanTarget
      if (target) {
        creep.memory._arrive = target
        if (arrive(creep) !== NOTHING_TODO) creep.memory.state = State.SCOUT
      }
      break
    default:
      creep.memory.state = State.INIT
  }
}
