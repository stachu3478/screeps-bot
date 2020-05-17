import { HARVESTING, TOWER_FILL, SPAWN_FILL, REPAIR, BUILD, ARRIVE, ARRIVE_HOSTILE, DISMANTLE, STORAGE_FILL, STORAGE_DRAW, RECYCLE } from '../constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS, ACCEPTABLE } from '../constants/response'
import towerFill from 'routine/work/towerFill'
import spawnerFill from 'routine/work/spawnerFill'
import storageFill from 'routine/work/storageFill'
import repair from 'routine/work/repair'
import build from 'routine/work/build'
import place from 'planner/place'
import placeRoad from 'planner/placeRoad'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/work/autoPick'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import recycle from 'routine/recycle'
import drawContainer from 'routine/work/containerDraw';
import drawStorage from 'routine/work/storageDraw';
import placeShield from 'planner/placeShield';

export interface Harvester extends Creep {
  memory: HarvesterMemory
}

interface HarvesterMemory extends CreepMemory {
  _arrive?: string
  _harvest?: Id<Source>
  _fillTower?: Id<StructureTower>
  _fillSpawn?: Id<StructureSpawn | StructureExtension>
  _repair?: Id<Structure>
  _auto_repair?: Id<Structure>
  _repair_cooldown?: number
  _build?: Id<ConstructionSite>
  _dismantle?: Id<Structure>
  _pick_pos?: string
  _draw?: Id<AnyStoreStructure>
}

export default function harvester(creep: Harvester) {
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
          if (creep.room.name !== creep.memory.room) {
            creep.memory._arrive = creep.memory.room
            creep.memory.state = ARRIVE
          }
          autoPick(creep)
        } break
        case NOTHING_TODO: {
          if (creep.room.memory._dismantle) {
            creep.memory._arrive = creep.room.memory._dismantle
            creep.memory.state = ARRIVE_HOSTILE
            break
          }
          if (creep.room.storage || creep.room.terminal) {
            creep.memory.state = STORAGE_DRAW
            break
          }
          autoPick(creep)
        } break
        case NOTHING_DONE: autoPick(creep)
      }
    } break;
    case TOWER_FILL: {
      switch (towerFill(creep)) {
        case NO_RESOURCE: case FAILED: if (autoPick(creep) !== SUCCESS) {
          if (drawStorage(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
          else creep.memory.state = HARVESTING
        } break
        case NOTHING_TODO: creep.memory.state = SPAWN_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case SPAWN_FILL: {
      switch (spawnerFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) {
          if (drawStorage(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
          else creep.memory.state = HARVESTING
        } break
        case NOTHING_TODO: {
          creep.memory.state = REPAIR
        } break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case REPAIR: {
      switch (repair(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) {
          if (drawStorage(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
          else creep.memory.state = HARVESTING
        } break
        case NOTHING_TODO: creep.memory.state = BUILD; break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case BUILD: {
      switch (build(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) {
          if (drawStorage(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
          else creep.memory.state = HARVESTING
        } break
        case FAILED: creep.memory.state = TOWER_FILL; break
        case NOTHING_TODO: {
          if (place(creep.room) === SUCCESS || placeRoad(creep.room) === SUCCESS) break
          if (storageFill(creep) in ACCEPTABLE) creep.memory.state = STORAGE_FILL
          else creep.memory.state = HARVESTING
        }; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case STORAGE_FILL: {
      switch (storageFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case STORAGE_DRAW: {
      switch (drawStorage(creep)) {
        case DONE: case SUCCESS: {
          if (spawnerFill(creep) in ACCEPTABLE) creep.memory.state = SPAWN_FILL
          else if (towerFill(creep) in ACCEPTABLE) creep.memory.state = TOWER_FILL
          else if (build(creep) in ACCEPTABLE || place(creep.room) in ACCEPTABLE || placeRoad(creep.room) in ACCEPTABLE || placeShield(creep.room) in ACCEPTABLE) creep.memory.state = BUILD
          else creep.memory.state = HARVESTING
        } break
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoPick(creep); break
      }
    } break
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
    default: {
      if (creep.room.storage) creep.memory.state = STORAGE_DRAW
      else creep.memory.state = HARVESTING
    }
  }
}
