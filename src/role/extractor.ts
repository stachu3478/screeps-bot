import mineralFill from "routine/work/mineralFill";
import { HARVESTING, STORAGE_FILL, RECYCLE } from "constants/state";
import { SUCCESS, DONE, NOTHING_TODO, NO_RESOURCE, NOTHING_DONE, ACCEPTABLE } from "constants/response";
import recycle from "routine/recycle";
import extract from "routine/work/extract";
import autoPick from "routine/work/autoPickMineral";

export default function extractor(creep: Creep) {
  switch (creep.memory.state) {
    case HARVESTING: {
      switch (extract(creep)) {
        case DONE: creep.memory.state = STORAGE_FILL; break
        case NOTHING_TODO: creep.memory.state = RECYCLE; break
        case NOTHING_DONE: if (creep.memory._extract) autoPick(creep, creep.memory._extract)
      }
    } break
    case STORAGE_FILL: {
      const mineralType = creep.memory._extract
      if (!mineralType) {
        creep.memory.state = HARVESTING
        return
      }
      switch (mineralFill(creep, mineralType)) {
        case SUCCESS: case NO_RESOURCE: {
          if (creep.memory._extract && autoPick(creep, creep.memory._extract) in ACCEPTABLE) creep.memory.state = STORAGE_FILL
          else creep.memory.state = HARVESTING
        }
      }
    } break
    case RECYCLE: {
      switch (recycle(creep)) {
        case DONE: delete Memory.creeps[creep.name]
      }
    }; break
    default: {
      creep.memory.state = HARVESTING
    }
  }
}
