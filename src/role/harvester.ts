import { HARVESTING, TOWER_FILL, SPAWN_FILL, REPAIR, BUILD, ARRIVE, ARRIVE_HOSTILE, DISMANTLE, STORAGE_FILL, STORAGE_DRAW, RECYCLE, IDLE } from '../constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS, ACCEPTABLE } from '../constants/response'
import towerFill from 'routine/haul/towerFill'
import spawnerFill from 'routine/haul/spawnerFill'
import storageFill from 'routine/haul/storageFill'
import repair from 'routine/work/repair'
import build from 'routine/work/build'
import place from 'planner/place/place'
import placeRoad from 'planner/place/road'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import recycle from 'routine/recycle'
import drawContainer from 'routine/haul/containerDraw';
import drawStorage from 'routine/haul/storageDraw';
import placeShield from 'planner/place/shield';
import profiler from "screeps-profiler"
import { FACTORY_MANAGER } from 'constants/role';

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
  _noJob?: number
}

function findUpJob(creep: Harvester) {
  if (!creep.memory._noJob && drawStorage(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
  else if (drawContainer(creep) in ACCEPTABLE) creep.memory.state = HARVESTING
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = ARRIVE_HOSTILE
  } else if (creep.memory._noJob) {
    creep.memory._noJob = 0
    creep.memory.role = FACTORY_MANAGER
  }
}

function findDownJob(creep: Harvester) {
  let result
  creep.memory._noJob = 0
  if ((result = towerFill(creep)) in ACCEPTABLE) creep.memory.state = TOWER_FILL
  else if ((result = spawnerFill(creep)) in ACCEPTABLE) creep.memory.state = SPAWN_FILL
  else if ((result = repair(creep)) in ACCEPTABLE) creep.memory.state = REPAIR
  else if ((result = build(creep)) in ACCEPTABLE || place(creep.room) in ACCEPTABLE || placeRoad(creep.room) in ACCEPTABLE || placeShield(creep.room) in ACCEPTABLE) creep.memory.state = BUILD
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = ARRIVE_HOSTILE
  } else {
    if ((result = storageFill(creep)) in ACCEPTABLE) creep.memory.state = STORAGE_FILL
    creep.memory._noJob = 1
    if (result === NO_RESOURCE) creep.memory.state = IDLE
  }
}

export default profiler.registerFN(function harvester(creep: Harvester) {
  switch (creep.memory.state) {
    case IDLE: {
      if (creep.store[RESOURCE_ENERGY]) findDownJob(creep)
      else findUpJob(creep)
    } break
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
        case DONE: case SUCCESS: findDownJob(creep); break
        case FAILED: {
          if (creep.room.name !== creep.memory.room) {
            creep.memory._arrive = creep.memory.room
            creep.memory.state = ARRIVE
          }
          autoPick(creep)
        } break
        case NOTHING_TODO: {
          findUpJob(creep)
          autoPick(creep)
        } break
        case NOTHING_DONE: autoPick(creep)
      }
    } break;
    case TOWER_FILL: {
      switch (towerFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) findUpJob(creep); break
        case NOTHING_TODO: case FAILED: findDownJob(creep); break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case SPAWN_FILL: {
      switch (spawnerFill(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) findUpJob(creep); break
        case NOTHING_TODO: case FAILED: findDownJob(creep); break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case REPAIR: {
      switch (repair(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) findUpJob(creep); break
        case NOTHING_TODO: case FAILED: findDownJob(creep); break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case BUILD: {
      switch (build(creep)) {
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) findUpJob(creep); break
        case NOTHING_TODO: case FAILED: findDownJob(creep); break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case STORAGE_FILL: {
      switch (storageFill(creep)) {
        case NOTHING_DONE: autoRepair(creep); break;
        default: if (autoPick(creep) !== SUCCESS) findUpJob(creep);
      }
    } break;
    case STORAGE_DRAW: {
      switch (drawStorage(creep)) {
        case DONE: case SUCCESS: findDownJob(creep); break
        case NOTHING_TODO: case FAILED: findUpJob(creep); break
        case NOTHING_DONE: autoPick(creep); break
      }
    } break
    case ARRIVE: {
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: findUpJob(creep); break
      }
    } break;
    case ARRIVE_HOSTILE: {
      switch (arrive(creep)) {
        case NOTHING_TODO: case DONE: creep.memory.state = DISMANTLE; break
      }
    } break;
    default: {
      findUpJob(creep)
    }
  }
}, 'roleHarvester')
