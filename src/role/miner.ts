import _ from 'lodash'
import { NOTHING_TODO, NOTHING_DONE, DONE, NO_RESOURCE, FAILED, ACCEPTABLE } from 'constants/response'
import harvest from 'routine/work/harvest';
import { HARVESTING, REPAIR, BUILD } from 'constants/state';
import autoFill from 'routine/work/autoFill';
import autoRepair from 'routine/work/autoRepair';
import autoBuild from 'routine/work/autoBuild';
import autoPick from 'routine/work/autoPick';
import { roomPos } from 'planner/pos';

export default function miner(creep: Creep) {
  switch (creep.memory.state) {
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
            if (!container || miningPos.createConstructionSite(STRUCTURE_CONTAINER) === 0) {
              if (container) creep.memory._repair = container.id
              else creep.memory.state = BUILD
              break
            }
            const rampart = _.find(miningPos.lookFor(LOOK_STRUCTURES), s => s.structureType === STRUCTURE_RAMPART)
            if (!rampart || miningPos.createConstructionSite(STRUCTURE_RAMPART) === 0) {
              if (rampart) creep.memory._repair = rampart.id
              else creep.memory.state = BUILD
              break
            }
            creep.say(result + '')
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
    default: creep.memory.state = HARVESTING;
  }
}
