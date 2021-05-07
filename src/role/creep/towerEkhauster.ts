import { DONE, NOTHING_TODO } from 'constants/response'
import arrive, { ArriveCreep } from 'routine/arrive'
import recycle from 'routine/recycle'
import profiler from 'screeps-profiler'
import collectGarbage from 'utils/collectGarbage'

export default profiler.registerFN(function towerEkhauster(creep: ArriveCreep) {
  if (creep.hits < creep.hitsMax) creep.heal(creep)
  switch (creep.memory.state) {
    case State.IDLE:
      const target = creep.motherRoom.memory[RoomMemoryKeys.ekhaust]
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
      switch (arrive(creep)) {
        case NOTHING_TODO:
        case DONE:
          const towersEkhausted = creep.room
            .find(FIND_HOSTILE_STRUCTURES)
            .every(
              (s) =>
                s.structureType !== STRUCTURE_TOWER ||
                !s.store[RESOURCE_ENERGY],
            )
          if (!towersEkhausted || creep.hits < creep.hitsMax) break
          delete creep.motherRoom.memory[RoomMemoryKeys.ekhaust]
          creep.motherRoom.memory._rangedAttack = creep.room.name
          creep.memory.state = State.IDLE
          break
      }
      break
    default:
      creep.memory.state = State.IDLE
  }
}, 'roleTowerEkhauster')
