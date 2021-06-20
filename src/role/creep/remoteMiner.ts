import { NOTHING_TODO, NO_RESOURCE, FAILED } from 'constants/response'
import autoRepair from 'routine/work/autoRepair'
import autoBuild from 'routine/work/autoBuild'
import ProfilerPlus from 'utils/ProfilerPlus'
import MemoryHandler from 'handler/MemoryHandler'
import move from 'utils/path'
import maintainContainer from 'routine/work/maintainContainer'
import recycle from 'routine/recycle'

export interface RemoteMiner extends Creep {
  memory: RemoteMinerMemory
}

export interface RemoteMinerMemory extends CreepMemory {
  mine: Lookup<RoomPosition>
}

export default ProfilerPlus.instance.overrideFn(function miner(
  creep: RemoteMiner,
) {
  const lookup = creep.memory.mine
  const sourcePosition = RoomPosition.from(lookup)
  const miningTarget = MemoryHandler.sources[lookup]
  if (!miningTarget) {
    recycle(creep)
    return
  }
  const roomName = sourcePosition.roomName
  const invaders = Game.rooms[roomName]?.findHostileCreeps(
    (c) => c.corpus.armed,
  ).length
  const miningPosition = RoomPosition.from(miningTarget.miningPosition)
  if (invaders || !miningTarget) {
    creep.moveToRoom(creep.memory.room)
    creep.say(invaders.toString())
  } else if (roomName !== creep.room.name) {
    creep.moveToRoom(roomName)
  } else if (!creep.pos.isEqualTo(miningPosition)) {
    move.cheap(creep, miningPosition)
  } else {
    const source = sourcePosition.lookFor(LOOK_SOURCES)[0]
    if (creep.store.getFreeCapacity() === 0) {
      maintainContainer(creep, miningPosition)
    }
    switch (creep.memory.state) {
      case State.HARVESTING:
        creep.harvest(source)
        break
      case State.REPAIR:
        switch (autoRepair(creep)) {
          case NO_RESOURCE:
            creep.memory.state = State.HARVESTING
            break
          case NOTHING_TODO:
            creep.memory.state = State.BUILD
            break
        }
        break
      case State.BUILD:
        switch (autoBuild(creep)) {
          case NO_RESOURCE:
            creep.memory.state = State.HARVESTING
            break
          case NOTHING_TODO:
          case FAILED:
            creep.memory.state = State.HARVESTING
            break
        }
        break
      default:
        creep.memory.state = State.HARVESTING
    }
  }
},
'roleRemoteMiner')
