import autoRepair from 'routine/work/autoRepair'
import ProfilerPlus from 'utils/ProfilerPlus'
import MemoryHandler from 'handler/MemoryHandler'
import move from 'utils/path'
import _ from 'lodash'

export interface Collector extends Creep {
  memory: CollectorMemory
}

export interface CollectorMemory extends CreepMemory {
  collect: Lookup<RoomPosition>
  put?: Id<AnyStoreStructure>
}

export default ProfilerPlus.instance.overrideFn(function collector(
  creep: Collector,
) {
  const lookup = creep.memory.collect
  const sourcePosition = RoomPosition.from(lookup)
  const collectTarget = MemoryHandler.sources[lookup]
  const roomName = sourcePosition.roomName
  const invaders = Game.rooms[roomName]?.findHostileCreeps().length
  const miningPosition = RoomPosition.from(collectTarget.miningPosition)
  if (invaders || !collectTarget) {
    creep.moveToRoom(creep.memory.room)
    creep.say(invaders.toString())
    return
  }
  switch (creep.memory.state) {
    case State.ARRIVE:
      if (roomName !== creep.room.name) {
        creep.moveToRoom(roomName)
      } else if (!creep.pos.isNearTo(miningPosition)) {
        move.cheap(creep, miningPosition, true, 1, 1)
      } else if (
        !creep.store.getFreeCapacity(RESOURCE_ENERGY) ||
        creep.isRetired
      ) {
        creep.memory.state = State.ARRIVE_BACK
      } else {
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
      }
      break
    case State.ARRIVE_BACK:
      if (!creep.store[RESOURCE_ENERGY]) {
        creep.memory.state = State.ARRIVE
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
        creep.transfer(structureToPutIn, RESOURCE_ENERGY)
      }
      break
    default:
      creep.memory.state = State.ARRIVE
  }
},
'roleCollector')
