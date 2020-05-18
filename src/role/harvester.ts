import { HARVESTING, TOWER_FILL, SPAWN_FILL, REPAIR, BUILD, ARRIVE, ARRIVE_HOSTILE, DISMANTLE, STORAGE_FILL, STORAGE_DRAW, RECYCLE, HAUL_FACTORY_FROM_TERMINAL, HAUL_TERMINAL_TO_FACTORY, HAUL_TERMINAL_FROM_FACTORY, HAUL_FACTORY_TO_TERMINAL, FACT_WORKING, FACT_BOARD } from '../constants/state'
import { DONE, NOTHING_DONE, NOTHING_TODO, FAILED, NO_RESOURCE, SUCCESS, ACCEPTABLE } from '../constants/response'
import towerFill from 'routine/haul/towerFill'
import spawnerFill from 'routine/haul/spawnerFill'
import storageFill from 'routine/haul/storageFill'
import repair from 'routine/work/repair'
import build from 'routine/work/build'
import place from 'planner/place'
import placeRoad from 'planner/placeRoad'
import autoRepair from 'routine/work/autoRepair'
import autoPick from 'routine/haul/autoPick'
import arrive from 'routine/arrive'
import dismantle from 'routine/work/dismantle'
import recycle from 'routine/recycle'
import drawContainer from 'routine/haul/containerDraw';
import drawStorage from 'routine/haul/storageDraw';
import placeShield from 'planner/placeShield';
import draw from 'routine/haul/draw';
import { getXYFactory } from 'utils/selectFromPos';
import fill from 'routine/haul/fill';
import { factoryStoragePerResource } from 'utils/handleFactory';

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
  _drawAmount?: number
  _drawType?: ResourceConstant
  _fill?: Id<AnyStoreStructure>
  _fillType?: ResourceConstant
}

function findOtherJob(creep: Harvester) {
  const factoryPos = (creep.room.memory.structs || '').charCodeAt(4)
  const factory = getXYFactory(creep.room, factoryPos & 63, factoryPos >> 6)
  if (!factory) return console.log("ERROR not factory")
  if (!creep.room.terminal) return console.log("ERROR no term")
  if (creep.room.memory.factoryNeeds) {
    const type = creep.room.memory.factoryNeeds
    creep.memory._draw = creep.room.terminal.id
    creep.memory._drawType = type
    creep.memory._drawAmount = factoryStoragePerResource - factory.store[type]
    creep.memory.state = HAUL_FACTORY_FROM_TERMINAL
    console.log('DA job found' + creep.room.name)
  } else if (creep.room.memory.factoryDumps) {
    const type = creep.room.memory.factoryDumps
    creep.memory._draw = factory.id
    creep.memory._drawType = type
    creep.memory._drawAmount = factory.store[type]
    creep.memory.state = HAUL_TERMINAL_FROM_FACTORY
    console.log('DA job found out ' + creep.room.name)
  }
}

function findUpJob(creep: Harvester) {
  if (drawStorage(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
  else if (drawContainer(creep) in ACCEPTABLE) creep.memory.state = HARVESTING
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = ARRIVE_HOSTILE
  } else findOtherJob(creep)
}

function findDownJob(creep: Harvester) {
  let result
  if ((result = towerFill(creep)) in ACCEPTABLE) creep.memory.state = TOWER_FILL
  else if ((result = spawnerFill(creep)) in ACCEPTABLE) creep.memory.state = SPAWN_FILL
  else if ((result = build(creep)) in ACCEPTABLE || place(creep.room) in ACCEPTABLE || placeRoad(creep.room) in ACCEPTABLE || placeShield(creep.room) in ACCEPTABLE) creep.memory.state = BUILD
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = ARRIVE_HOSTILE
  } else if ((result = storageFill(creep)) in ACCEPTABLE) creep.memory.state = STORAGE_FILL
  else if (result === NO_RESOURCE) findOtherJob(creep)
  creep.say(result + '')
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
        case NO_RESOURCE: if (autoPick(creep) !== SUCCESS) creep.memory.state = HARVESTING; break
        case NOTHING_TODO: case FAILED: creep.memory.state = HARVESTING; break
        case NOTHING_DONE: autoRepair(creep); break;
      }
    } break;
    case STORAGE_DRAW: {
      switch (drawStorage(creep)) {
        case DONE: case SUCCESS: findDownJob(creep); break
        case NOTHING_TODO: case FAILED: findUpJob(creep); break
        case NOTHING_DONE: autoPick(creep); break
      }
    } break
    case HAUL_FACTORY_FROM_TERMINAL: {
      if (creep.store.getUsedCapacity()) {
        findUpJob(creep)
        break
      }
      switch (draw(creep)) {
        case DONE: case SUCCESS: {
          const factoryPos = (creep.room.memory.structs || '').charCodeAt(4)
          const factory = getXYFactory(creep.room, factoryPos & 63, factoryPos >> 6)
          if (factory) {
            creep.memory._fill = factory.id
            creep.memory._fillType = creep.room.memory.factoryNeeds
            creep.memory.state = HAUL_TERMINAL_TO_FACTORY
          } else creep.memory.state = HAUL_FACTORY_TO_TERMINAL
        } break
        case NOTHING_TODO: case FAILED: findUpJob(creep); break
      }
    } break
    case HAUL_TERMINAL_TO_FACTORY: {
      switch (fill(creep)) {
        case DONE: case SUCCESS:
          creep.room.memory.factoryState = FACT_BOARD
          delete creep.room.memory.factoryNeeds
          findUpJob(creep)
          break
        case NOTHING_TODO: case FAILED:
          if (!creep.room.terminal) break
          creep.memory._fill = creep.room.terminal.id
          creep.memory.state = HAUL_FACTORY_TO_TERMINAL
          console.log('Epic fail FACT')
          break
      }
    } break
    case HAUL_TERMINAL_FROM_FACTORY: {
      switch (draw(creep)) {
        case DONE: case SUCCESS: {
          if (creep.room.terminal) {
            creep.memory._fill = creep.room.terminal.id
            creep.memory._fillType = creep.room.memory.factoryDumps
            creep.memory.state = HAUL_FACTORY_TO_TERMINAL
          } else creep.memory.state = HAUL_TERMINAL_TO_FACTORY
        } break
        case NOTHING_TODO: case FAILED: findUpJob(creep); break
      }
    } break
    case HAUL_FACTORY_TO_TERMINAL: {
      switch (fill(creep)) {
        case DONE: case SUCCESS:
          delete creep.room.memory.factoryDumps
          findUpJob(creep)
          break
        case NOTHING_TODO: case FAILED:
          const factoryPos = (creep.room.memory.structs || '').charCodeAt(4)
          const factory = getXYFactory(creep.room, factoryPos & 63, factoryPos >> 6)
          if (factory) {
            creep.memory._fill = factory.id
            creep.memory.state = HAUL_TERMINAL_TO_FACTORY
          }
          console.log('Epic fail TERM')
          break
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
}
