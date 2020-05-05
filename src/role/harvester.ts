import { HARVESTING, TOWER_FILL, SPAWN_FILL, REPAIR, BUILD, UPGRADE, ARRIVE, ARRIVE_HOSTILE, DISMANTLE, STORAGE_FILL, STORAGE_DRAW, RECYCLE } from '../constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS } from '../constants/response'
import harvest from 'routine/work/harvest'
import towerFill from 'routine/work/towerFill'
import spawnerFill from 'routine/work/spawnerFill'
import storageFill from 'routine/work/storageFill'
import storageDraw from 'routine/work/storageDraw'
import repair from 'routine/work/repair'
import build from 'routine/work/build'
import upgrade from 'routine/work/upgrade'
import place from 'planner/place'
import placeRoad from 'planner/placeRoad'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/work/autoPick'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import recycle from 'routine/recycle'
import drawContainer from 'routine/work/containerDraw';

export default function run(creep: Creep) {
  switch (creep.memory.state) {
    case RECYCLE: {
      switch (recycle(creep)) {
        case DONE: delete Memory.creeps[creep.name]
      }
    } break;
    case DISMANTLE: {
      switch (dismantle(creep)) {
        case NOTHING_TODO: case FAILED: {
          delete creep.room.memory._dismantle
          creep.memory._arrive = creep.memory.room
          creep.memory.state = ARRIVE
        } break
        case DONE: {
          creep.memory._arrive = creep.memory.room
          creep.memory.state = ARRIVE
        } break
      }
    } break;
    case HARVESTING: {
      switch (drawContainer(creep)) {
        case DONE: case SUCCESS: creep.memory.state = TOWER_FILL; break
        case FAILED: {
          creep.memory._arrive = creep.memory.room
          creep.memory.state = ARRIVE
        } break
        case NOTHING_TODO: {
          if (creep.room.memory._dismantle) {
            creep.memory._arrive = creep.room.memory._dismantle
            creep.memory.state = ARRIVE_HOSTILE
            break
          }
          creep.memory.state = STORAGE_DRAW
        } break
        case NOTHING_DONE: autoPick(creep)
      }
    } break;
    case TOWER_FILL: {
      switch (towerFill(creep)) {
        case NO_RESOURCE: case FAILED: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case NOTHING_TODO: creep.memory.state = SPAWN_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case SPAWN_FILL: {
      switch (spawnerFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case NOTHING_TODO: {
          creep.memory.state = REPAIR
        } break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case REPAIR: {
      switch (repair(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case NOTHING_TODO: creep.memory.state = BUILD; break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case BUILD: {
      switch (build(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_TODO: {
          if (place(creep.room) === SUCCESS || placeRoad(creep.room) === SUCCESS) break
          if (storageFill(creep) === NOTHING_DONE) creep.memory.state = STORAGE_FILL
          else creep.memory.state = UPGRADE
        }; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case STORAGE_FILL: {
      switch (storageFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case NOTHING_TODO: case FAILED: creep.memory.state = UPGRADE; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case STORAGE_DRAW: {
      switch (storageDraw(creep)) {
        case DONE: case SUCCESS: {
          if (spawnerFill(creep) === NOTHING_DONE) creep.memory.state = SPAWN_FILL
          else if (towerFill(creep) === NOTHING_DONE) creep.memory.state = TOWER_FILL
          else creep.memory.state = UPGRADE
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoPick(creep); break
      }
    } break
    case UPGRADE: {
      switch (upgrade(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case ARRIVE: {
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: creep.memory.state = HARVESTING; break
      }
    } break;
    case ARRIVE_HOSTILE: {
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: creep.memory.state = DISMANTLE; break
      }
    } break;
    default: creep.memory.state = HARVESTING
  }
}
