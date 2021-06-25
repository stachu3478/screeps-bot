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
import maintainBuilding from 'routine/work/maintainBuilding'

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
  pick_pos?: string
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
          delete creep.cache.pick_pos
        case DONE:
          const result = creep.motherRoom.spawn ? autoFill(creep) : FAILED
          if (result in ACCEPTABLE || result === NO_RESOURCE) {
            // nothing to do
          } else if (creep.memory._draw && autoRepair(creep, 0) in ACCEPTABLE)
            creep.memory.state = State.REPAIR
          else if (autoBuild(creep) in ACCEPTABLE)
            creep.memory.state = State.BUILD
          else if (index !== -1) {
            const miningPosition = creep.motherRoom.sources.getPosition(index)
            if (!maintainBuilding(creep, miningPosition, STRUCTURE_CONTAINER)) {
              maintainBuilding(creep, miningPosition, STRUCTURE_RAMPART)
            }
          }
          break
        case NOTHING_DONE:
          autoRepair(creep)
      }
      break
    case State.REPAIR:
      switch (autoRepair(creep)) {
        case NO_RESOURCE:
          harvest(creep, index)
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
          harvest(creep, index)
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
}, 'roleMiner')
