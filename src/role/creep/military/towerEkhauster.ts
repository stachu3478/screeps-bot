import { DONE, NOTHING_TODO } from 'constants/response'
import arrive, { ArriveCreep } from 'routine/arrive'
import recycle from 'routine/recycle'
import profiler from 'screeps-profiler'
import collectGarbage from 'utils/collectGarbage'
import memoryLessAutoRangedAttack from 'routine/military/memoryLessAutoRangedAttack'
import move from 'utils/path'

export default profiler.registerFN(function towerEkhauster(creep: ArriveCreep) {
  creep.heal(creep)
  const target = creep.motherRoom.memory[RoomMemoryKeys.ekhaust]
  switch (creep.memory.state) {
    case State.IDLE:
      if (target) {
        creep.memory.state = State.ARRIVE
        creep.memory._arrive = target
      } else creep.memory.state = State.RECYCLE
      break
    case State.RECYCLE:
      if (recycle(creep) === DONE) {
        collectGarbage(creep.name)
      }
      break
    case State.ARRIVE:
      if (!creep.corpus.hasActive(TOUGH)) {
        creep.memory.state = State.FALL_BACK
        creep.memory._arrive = creep.memory.room
        arrive(creep)
      } else if (creep.pos.isBorder()) {
        move.anywhere(creep, creep.pos.getDirectionTo(25, 25))
      }
      switch (arrive(creep)) {
        case NOTHING_TODO:
        case DONE:
          const towersEkhausted = creep.room.buildings.towers.every(
            (s) =>
              s.structureType !== STRUCTURE_TOWER || !s.store[RESOURCE_ENERGY],
          )
          if (memoryLessAutoRangedAttack(creep)) break
          if (!towersEkhausted || creep.hits < creep.hitsMax) break
          delete creep.motherRoom.memory[RoomMemoryKeys.ekhaust]
          creep.motherRoom.memory._rangedAttack = creep.room.name
          creep.memory.state = State.IDLE
          break
      }
      break
    case State.FALL_BACK:
      arrive(creep)
      if (target && creep.hits === creep.hitsMax) {
        creep.memory.state = State.ARRIVE
        creep.memory._arrive = target
      }
      break
    default:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.IDLE
  }
}, 'roleTowerEkhauster')
