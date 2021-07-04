import ProfilerPlus from 'utils/ProfilerPlus'
import MemoryHandler from 'handler/MemoryHandler'
import move from 'utils/path/path'
import _ from 'lodash'
import recycle from 'routine/recycle'
import remoteMining from 'config/remoteMining'
import { maintainBuildingActively } from 'routine/work/maintainBuilding'
import autoBuild from 'routine/work/autoBuild'
import { FAILED, NOTHING_TODO } from 'constants/response'

export interface Collector extends RoleCreep<Role.COLLECTOR> {
  memory: CollectorMemory
}

export interface CollectorMemory extends RoleCreepMemory<Role.COLLECTOR> {
  put?: Id<AnyStoreStructure>
}

function canGoAndReturn(creep: Creep, from: SourceMemory) {
  return (creep.ticksToLive || 0) > from.cost * 2
}

function canReturnBack(creep: Creep, from: SourceMemory) {
  return (creep.ticksToLive || 0) > from.cost
}

function canMarginlyReturnBack(creep: Creep, from: SourceMemory) {
  return (
    (creep.ticksToLive || 0) >
    from.cost + remoteMining.sources.haulerReturnTimeMargin
  )
}

function buildAndMaintainRoads(creep: Creep) {
  const result = autoBuild(creep)
  if (result === NOTHING_TODO || result === FAILED) {
    maintainBuildingActively(creep, creep.pos, STRUCTURE_ROAD)
  }
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
        buildAndMaintainRoads(creep)
        if (!canReturnBack(creep, collectTarget)) {
          if (move.cheap(creep, miningPosition, false) === 0) {
            creep.suicide()
          }
        } else if (canHold && canMarginlyReturnBack(creep, collectTarget)) {
          const resource = _.find(miningPosition.lookFor(LOOK_RESOURCES))
          if (
            resource &&
            resource.amount > remoteMining.sources.resourcePickupAmountThreshold
          ) {
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
        if (canGoAndReturn(creep, collectTarget)) {
          creep.memory.state = State.ARRIVE
        } else {
          recycle(creep)
        }
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
        buildAndMaintainRoads(creep)
      } else if (structureToPutIn && !creep.pos.isNearTo(structureToPutIn)) {
        move.cheap(creep, structureToPutIn, true, 1, 1)
        buildAndMaintainRoads(creep)
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
