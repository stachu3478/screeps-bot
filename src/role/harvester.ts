import { HARVESTING, TOWER_FILL, SPAWN_FILL, REPAIR, BUILD, UPGRADE, ARRIVE, ARRIVE_HOSTILE, DISMANTLE } from '../constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS } from '../constants/response'
import harvest from 'routine/work/harvest'
import towerFill from 'routine/work/towerFill'
import spawnerFill from 'routine/work/spawnerFill'
import repair from 'routine/work/repair'
import build from 'routine/work/build'
import upgrade from 'routine/work/upgrade'
import place from 'planner/place'
import placeRoad from 'planner/placeRoad'
import autoRepair from 'routine/work/autoRepair'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'

export default function run(creep: Creep) {
  switch (creep.memory.state) {
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
      switch (harvest(creep, Memory.rooms[creep.memory.room].colonySourceId)) {
        case DONE: creep.memory.state = TOWER_FILL; break
        case FAILED: {
          creep.memory._arrive = creep.memory.room
          creep.memory.state = ARRIVE
        } break
        case NOTHING_TODO: {
          creep.memory._arrive = creep.room.memory._dismantle
          creep.memory.state = ARRIVE_HOSTILE
        } break
      }
    } break;
    case TOWER_FILL: {
      switch (towerFill(creep)) {
        case NO_RESOURCE: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_TODO: creep.memory.state = SPAWN_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case SPAWN_FILL: {
      switch (spawnerFill(creep)) {
        case NO_RESOURCE: creep.memory.state = HARVESTING; break
        case NOTHING_TODO: creep.memory.state = REPAIR; break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case REPAIR: {
      switch (repair(creep)) {
        case NO_RESOURCE: creep.memory.state = HARVESTING; break
        case NOTHING_TODO: creep.memory.state = BUILD; break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case BUILD: {
      const result = build(creep)
      creep.say(result + "")
      switch (result) {
        case NO_RESOURCE: creep.memory.state = HARVESTING; break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_TODO: {
          if (place(creep.room) === SUCCESS || placeRoad(creep.room) === SUCCESS) break
          creep.memory.state = UPGRADE
        }; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case UPGRADE: {
      switch (upgrade(creep)) {
        case NO_RESOURCE: creep.memory.state = HARVESTING; break
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
