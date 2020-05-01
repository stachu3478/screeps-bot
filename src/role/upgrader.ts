import { HARVESTING, UPGRADE } from '../constants/state'
import { DONE, NOTHING_DONE, FAILED, NO_RESOURCE } from '../constants/response'
import harvest from 'routine/work/harvest'
import upgrade from 'routine/work/upgrade'
import autoRepair from 'routine/work/autoRepair'

export default function run(creep: Creep) {
  switch (creep.memory.state) {
    case HARVESTING: {
      switch (harvest(creep, creep.room.memory.controllerSourceId)) {
        case DONE: creep.memory.state = UPGRADE; break
      }
    } break;
    case UPGRADE: {
      switch (upgrade(creep)) {
        case NO_RESOURCE: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoRepair(creep); break
      }
    } break;
    default: {
      creep.memory.state = HARVESTING
    }
  }
}
