import {
  NOTHING_TODO,
  NOTHING_DONE,
  DONE,
  NO_RESOURCE,
  FAILED,
  ACCEPTABLE,
} from 'constants/response'
import harvest from 'routine/work/harvest'
import autoFill from 'routine/haul/autoFill'
import autoRepair from 'routine/work/autoRepair'
import autoBuild from 'routine/work/autoBuild'
import ProfilerPlus from 'utils/ProfilerPlus'
import maintainBuilding, {
  maintainBuildingActively,
} from 'routine/work/maintainBuilding'

export interface Miner extends Creep {
  memory: MinerMemory
  cache: MinerCache
}

export interface MinerMemory extends CreepMemory {
  _draw?: Id<AnyStoreStructure>
}

interface MinerCache extends CreepCache {
  auto_repair?: Id<Structure>
  repair_cooldown?: number
  build?: Id<ConstructionSite>
}

export default ProfilerPlus.instance.overrideFn(function miner(creep: Miner) {
  const sourceHandler = creep.motherRoom.sources
  const index = sourceHandler.getOrAssign(creep)
  switch (creep.memory.state) {
    case State.HARVESTING:
      if (index === -1) {
        creep.say('^_^t')
        break
      }
      switch (harvest(creep, index, creep.motherRoom)) {
        case NOTHING_TODO:
        case DONE:
          const result = creep.motherRoom.spawn ? autoFill(creep) : FAILED
          if (result in ACCEPTABLE || result === NO_RESOURCE) {
            // nothing to do
          } else if (creep.memory._draw && autoRepair(creep, 0) in ACCEPTABLE)
            creep.memory.state = State.REPAIR
          else if (index !== -1) {
            const miningPosition = creep.motherRoom.sources.getPosition(index)
            if (
              !maintainBuildingActively(
                creep,
                miningPosition,
                STRUCTURE_CONTAINER,
              )
            ) {
              if (!autoBuild(creep)) {
                if (
                  !maintainBuildingActively(
                    creep,
                    miningPosition,
                    STRUCTURE_RAMPART,
                  )
                ) {
                  autoRepair(creep)
                }
              }
            }
          }
          break
        case NOTHING_DONE:
          autoRepair(creep)
      }
      break
    default:
      creep.memory.state = State.HARVESTING
  }
}, 'roleMiner')
