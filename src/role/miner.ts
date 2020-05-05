import _ from 'lodash'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, DONE, NO_RESOURCE } from 'constants/response'
import harvest from 'routine/work/harvest';
import { HARVESTING, STORAGE_FILL, REPAIR, BUILD } from 'constants/state';
import autoFill from 'routine/work/autoFill';
import autoRepair from 'routine/work/autoRepair';
import autoBuild from 'routine/work/autoBuild';
import autoPick from 'routine/work/autoPick';

export default function miner(creep: Creep) {
  switch (creep.memory.state) {
    case HARVESTING: {
      switch (harvest(creep, creep.memory._harvest)) {
        case DONE: case NOTHING_TODO: {
          if (autoFill(creep) === SUCCESS) creep.memory.state = STORAGE_FILL
          else if (autoRepair(creep, 0) === SUCCESS) creep.memory.state = REPAIR
          else if (autoBuild(creep) === SUCCESS) creep.memory.state = BUILD
          else {
            const container = _.find(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType === STRUCTURE_CONTAINER)
            if (!container && creep.pos.createConstructionSite(STRUCTURE_CONTAINER) === 0) {
              creep.memory.state = BUILD
              break
            }
            const rampart = _.find(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType === STRUCTURE_RAMPART)
            if (!rampart && creep.pos.createConstructionSite(STRUCTURE_RAMPART) === 0) {
              creep.memory.state = BUILD
              break
            }
            creep.say("duppa")
          }
        } break
        case NOTHING_DONE: autoPick(creep)
      }
    } break
    case STORAGE_FILL: {
      switch (autoFill(creep)) {
        case NO_RESOURCE: harvest(creep); creep.memory.state = HARVESTING; break;
        case NOTHING_TODO: creep.memory.state = REPAIR; break;
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
        case NOTHING_TODO: creep.memory.state = HARVESTING; break;
      }
    } break
    default: creep.memory.state = HARVESTING;
  }
}
