import autoRepair from 'routine/work/autoRepair'
import ProfilerPlus from 'utils/ProfilerPlus'
import MemoryHandler from 'handler/MemoryHandler'
import move from 'utils/path'
import _ from 'lodash'
import recycle from 'routine/recycle'

export interface Collector extends Creep {
  memory: CollectorMemory
}

export interface CollectorMemory extends CreepMemory {
  collect: Lookup<RoomPosition>
  put?: Id<AnyStoreStructure>
}

function canReturnBack(creep: Creep, from: SourceMemory) {
  return (creep.ticksToLive || 0) - creep.memory.deprivity / 2 > from.cost
}

export default ProfilerPlus.instance.overrideFn(function collector(
  creep: Collector,
) {
  const lookup = creep.memory.collect
  const sourcePosition = RoomPosition.from(lookup)
  const collectTarget = MemoryHandler.sources[lookup]
  if (!collectTarget) {
    recycle(creep)
    return
  }
  const roomName = sourcePosition.roomName
  const invaders = Game.rooms[roomName]?.findHostileCreeps(
    (c) => c.corpus.armed,
  ).length
  const miningPosition = RoomPosition.from(collectTarget.miningPosition)
  if (invaders || !collectTarget) {
    creep.moveToRoom(creep.memory.room)
    creep.say(invaders.toString())
    return
  }
  switch (creep.memory.state) {
    case State.ARRIVE:
      const isNear = creep.pos.isNearTo(miningPosition)
      const canHold = creep.store.getFreeCapacity(RESOURCE_ENERGY)
      if (roomName !== creep.room.name) {
        creep.moveToRoom(roomName)
      } else if (!isNear) {
        move.cheap(creep, miningPosition, true, 1, 1)
      } else {
        if (!canReturnBack(creep, collectTarget)) {
          move.cheap(creep, miningPosition, false)
          creep.suicide()
        } else if (canHold) {
          const resource = _.find(miningPosition.lookFor(LOOK_RESOURCES))
          if (resource && resource.amount > 50) {
            creep.pickup(resource)
            return
          }
          const container = miningPosition.building(STRUCTURE_CONTAINER)
          if (container) {
            creep.withdraw(container, RESOURCE_ENERGY)
            return
          }
        } else {
          creep.memory.state = State.ARRIVE_BACK
        }
      }
      break
    case State.ARRIVE_BACK:
      if (!creep.store[RESOURCE_ENERGY]) {
        creep.memory.state = State.ARRIVE
        return
      }
      const structureToPutIn = creep.memory.put
        ? Game.getObjectById(creep.memory.put)
        : creep.motherRoom.buildings
            .get(STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_CONTAINER)
            .find((s) => s.store.getFreeCapacity(RESOURCE_ENERGY))
      creep.memory.put = structureToPutIn?.id
      if (creep.memory.room !== creep.room.name) {
        creep.moveToRoom(creep.memory.room)
        autoRepair(creep)
      } else if (structureToPutIn && !creep.pos.isNearTo(structureToPutIn)) {
        move.cheap(creep, structureToPutIn, true, 1, 1)
        autoRepair(creep)
      } else if (structureToPutIn) {
        const result = creep.transfer(structureToPutIn, RESOURCE_ENERGY)
        if (result === 0) {
          const transferred = Math.min(
            structureToPutIn.store.getFreeCapacity(RESOURCE_ENERGY),
            creep.store[RESOURCE_ENERGY],
          )
          creep.motherRoom.remoteMiningMonitor.monit(transferred)
        }
      }
      break
    default:
      creep.memory.state = State.ARRIVE
  }
},
'roleCollector')
