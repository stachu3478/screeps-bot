import mineralFill from "routine/haul/mineralFill";
import State from "constants/state";
import { SUCCESS, DONE, NOTHING_TODO, NO_RESOURCE, NOTHING_DONE, ACCEPTABLE } from "constants/response";
import recycle from "routine/recycle";
import extract from "routine/work/extract";
import autoPick from "routine/haul/autoPickMineral";
import profiler from "screeps-profiler"

export interface Extractor extends Creep {
  memory: ExtractorMemory
}

export interface ExtractorMemory extends CreepMemory {
  _extract?: MineralConstant
}

export default profiler.registerFN(function extractor(creep: Extractor) {
  switch (creep.memory.state) {
    case State.HARVESTING:
      switch (extract(creep)) {
        case DONE:
          creep.memory.state = State.STORAGE_FILL; break
        case NOTHING_TODO:
          if (creep.store[creep.memory._extract || RESOURCE_ENERGY]) creep.memory.state = State.STORAGE_FILL
          else creep.memory.state = State.RECYCLE; break
        case NOTHING_DONE: if (creep.memory._extract) autoPick(creep, creep.memory._extract)
      }
      break
    case State.STORAGE_FILL:
      const mineralType = creep.memory._extract
      if (!mineralType) {
        creep.memory.state = State.HARVESTING
        return
      }
      switch (mineralFill(creep, mineralType)) {
        case SUCCESS: case NO_RESOURCE: {
          if (creep.memory._extract && autoPick(creep, creep.memory._extract) in ACCEPTABLE) creep.memory.state = State.STORAGE_FILL
          else creep.memory.state = State.HARVESTING
        }
      }
      break
    case State.RECYCLE:
      switch (recycle(creep)) {
        case DONE: delete Memory.creeps[creep.name]
      }
      break
    default:
      creep.memory.state = State.HARVESTING
  }
}, 'roleExtractor')
