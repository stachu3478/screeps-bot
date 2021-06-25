import { DONE, NOTHING_TODO } from 'constants/response'
import arrive, { ArriveCreep } from 'routine/arrive'
import recycle from 'routine/recycle'
import collectGarbage from 'utils/collectGarbage'
import move from 'utils/path/path'
import ProfilerPlus from 'utils/ProfilerPlus'

export default ProfilerPlus.instance.overrideFn(function towerEkhauster(
  creep: ArriveCreep,
) {
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
          delete creep.motherRoom.memory[RoomMemoryKeys.ekhaust]
          creep.motherRoom.memory._rangedAttack = creep.room.name
          creep.memory.state = State.IDLE
          break
      }
      break
    case State.FALL_BACK:
      arrive(creep)
      if (target && creep.corpus.healthy) {
        creep.memory.state = State.ARRIVE
        creep.memory._arrive = target
      }
      break
    default:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.IDLE
  }
},
'roleDestroyer')
