import { ALL_DIRECTIONS } from 'constants/support'
import move from 'utils/path'
import ProfilerPlus from 'utils/ProfilerPlus'

export default ProfilerPlus.instance.overrideFn(function depositMiner(
  creep: Creep,
) {
  const planner = creep.motherRoom.depositPlanner
  const targetRoom = planner.room
  if (!targetRoom) {
    return
  }
  switch (creep.memory.state) {
    case State.HARVESTING:
      const target = creep.room.find(FIND_DEPOSITS)[0]
      if (creep.room.name !== targetRoom) {
        creep.moveToRoom(targetRoom)
      } else if (
        creep.store.getFreeCapacity() <
          creep.corpus.count(WORK) * HARVEST_MINERAL_POWER ||
        (creep.ticksToLive || 0) - target.cooldown < planner.cost
      ) {
        creep.memory.state = State.ARRIVE_BACK
      } else {
        const result = creep.harvest(target)
        if (result === ERR_NOT_IN_RANGE) {
          const targetPos = ALL_DIRECTIONS.map((d) => {
            return target.pos.offset(d)
          }).find((pos) => pos && pos.isWalkable)
          if (targetPos) {
            move.cheap(creep, targetPos, true, 0, 1)
          }
        }
      }
      break
    case State.ARRIVE_BACK:
      if (creep.room.name !== creep.motherRoom.name) {
        creep.moveToRoom(creep.motherRoom.name)
      } else {
        const storage =
          creep.motherRoom.storage ||
          creep.motherRoom.terminal ||
          creep.motherRoom.buildings.factory
        if (!storage) {
          throw new Error('No storage')
        }
        const result = creep.transfer(
          storage,
          Object.keys(creep.store)[0] as ResourceConstant,
        )
        creep.say('[x]')
        if (result === ERR_NOT_IN_RANGE) {
          move.cheap(creep, storage, true, 1, 1)
        } else if (result === 0) {
          creep.memory.state = State.HARVESTING
        }
      }
      break
    default:
      creep.memory.state = State.HARVESTING
  }
},
'roleDepositMiner')
