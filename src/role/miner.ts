import _ from 'lodash'
import { NOTHING_TODO, NOTHING_DONE, DONE, NO_RESOURCE, FAILED, ACCEPTABLE } from 'constants/response'
import harvest from 'routine/work/harvest';
import { HARVESTING, REPAIR, BUILD, INIT } from 'constants/state';
import autoFill from 'routine/haul/autoFill';
import autoRepair from 'routine/work/autoRepair';
import autoBuild from 'routine/work/autoBuild';
import autoPick from 'routine/haul/autoPick';
import { roomPos } from 'planner/pos';

export interface Miner extends Creep {
  memory: MinerMemory
}

export interface MinerMemory extends CreepMemory {
  _harvest?: Id<Source>
  _auto_repair?: Id<Structure>
  _repair_cooldown?: number
  _build?: Id<ConstructionSite>
  _pick_pos?: string
  _draw?: Id<AnyStoreStructure>
}

export default function miner(creep: Miner) {
  switch (creep.memory.state) {
    case INIT: {
      if (!creep.memory._harvest) creep.memory._harvest = creep.room.memory.colonySourceId
      else creep.memory.state = HARVESTING
    } break
    case HARVESTING: {
      switch (harvest(creep, creep.memory._harvest)) {
        case DONE: case NOTHING_TODO: {
          const result = autoFill(creep)
          if (result in ACCEPTABLE || result === NO_RESOURCE) creep.memory.state = HARVESTING
          else if (creep.memory._draw && autoRepair(creep, 0) in ACCEPTABLE) creep.memory.state = REPAIR
          else if (autoBuild(creep) in ACCEPTABLE) creep.memory.state = BUILD
          else if (creep.room.memory.colonySources && creep.memory._harvest) {
            const miningPos = roomPos(creep.room.memory.colonySources[creep.memory._harvest][0], creep.room.name)
            if (miningPos.x !== creep.pos.x || miningPos.y !== creep.pos.y) {
              creep.drop(RESOURCE_ENERGY)
              return
            }
            const container = _.find(miningPos.lookFor(LOOK_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER)
            if (!container) {
              if (miningPos.createConstructionSite(STRUCTURE_CONTAINER) === 0) {
                creep.memory.state = BUILD
                break
              }
            } else if (container.hits < container.hitsMax) {
              creep.memory._auto_repair = container.id
              creep.memory.state = REPAIR
              break
            }
            const rampart = _.find(miningPos.lookFor(LOOK_STRUCTURES), s => s.structureType === STRUCTURE_RAMPART)
            if (!rampart) {
              if (miningPos.createConstructionSite(STRUCTURE_RAMPART) === 0) {
                creep.memory.state = BUILD
                break
              }
            } else {
              creep.memory._auto_repair = rampart.id
              creep.memory.state = REPAIR
              break
            }
            creep.say(result + ' ' + miningPos.x + ' ' + miningPos.y)
          }
        } break
        case NOTHING_DONE: autoPick(creep)
      }
    } break
    case REPAIR: {
      switch (autoRepair(creep)) {
        case NO_RESOURCE: harvest(creep); creep.memory.state = HARVESTING; break;
        case NOTHING_TODO: creep.memory.state = BUILD; break;
      }
    } break
    case BUILD: {
      switch (autoBuild(creep)) {
        case NO_RESOURCE: harvest(creep); creep.memory.state = HARVESTING; break;
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break;
      }
    } break
    default: creep.memory.state = INIT;
  }
}
