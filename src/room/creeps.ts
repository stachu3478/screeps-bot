import { HARVESTER, UPGRADER, CLAIMER, SCOUT, COMMANDER, MINER, RETIRED, EXTRACTOR, FIGHTER, STATIC_UPGRADER, COLONIZER, FACTORY_MANAGER, LAB_MANAGER, HAULER, BOOSTER } from '../constants/role'
import roleHarvester from '../role/creep/harvester'
import roleUpgrader from '../role/creep/upgrader'
import roleClaimer, { Claimer } from '../role/creep/claimer'
import roleScout, { Scout } from '../role/creep/scout'
import commander from '../role/creep/commander'
import miner from 'role/creep/miner';
import isRetired from 'utils/retired';
import extractor from 'role/creep/extractor';
import fighter from 'role/creep/fighter';
import staticUpgrader from '../role/creep/staticUpgrader';
import colonizer, { Colonizer } from 'role/creep/colonizer';
import factoryManager from 'role/creep/factoryManager';
import labManager from 'role/creep/labManager';
import hauler from 'role/creep/hauler';
import booster, { Booster } from 'role/creep/booster';

interface Creeps {
  [key: string]: 0
}

export default function creeps(creeps: Creeps, room: Room, enemy?: Creep, holdFire?: boolean) {
  const creepCountByRole: number[] = []
  const workPartCountByRole: number[] = []
  let count = 0
  for (const name in creeps) {
    const creep = Game.creeps[name]
    if (!creep) {
      if (room.memory.creeps) delete room.memory.creeps[name]
      delete Memory.creeps[name]
      continue
    }
    if (creep.memory.room !== room.name) {
      if (creep.room.name !== room.name) {
        if (room.memory.creeps) delete room.memory.creeps[name]
      } else {
        const otherMemRoom = Memory.rooms[creep.memory.room].creeps
        if (otherMemRoom) delete otherMemRoom[creep.name]
        creep.memory.room = room.name
      }
    }
    const role = creep.memory.role || 0
    if (!isRetired(creep)) {
      if (role === BOOSTER) {
        const targetRole = (creep as Booster).memory._targetRole
        creepCountByRole[targetRole] = (creepCountByRole[targetRole] || 0) + 1
      } else creepCountByRole[role] = (creepCountByRole[role] || 0) + 1
      workPartCountByRole[role] = (workPartCountByRole[role] || 0) + creep.getActiveBodyparts(WORK)
      count++
    } else creepCountByRole[RETIRED] = (creepCountByRole[RETIRED] || 0) + 1
    if (creep.spawning) continue
    try {
      switch (creep.memory.role) {
        case HARVESTER: roleHarvester(creep); break
        case UPGRADER: roleUpgrader(creep); break
        case STATIC_UPGRADER: staticUpgrader(creep); break
        case SCOUT: roleScout(creep as Scout); break
        case CLAIMER: roleClaimer(creep as Claimer); break
        case COMMANDER: commander(creep); break
        case MINER: miner(creep); break
        case EXTRACTOR: extractor(creep); break
        case FIGHTER: fighter(creep, enemy, holdFire); break
        case COLONIZER: colonizer(creep as Colonizer); break
        case FACTORY_MANAGER: factoryManager(creep); break
        case LAB_MANAGER: labManager(creep); break
        case HAULER: hauler(creep); break
        case BOOSTER: booster(creep); break
        default: creep.memory.role = UPGRADER;
      }
    } catch (err) {
      console.log(err.message, err.stack)
    }
  }

  return {
    creepCountByRole,
    workPartCountByRole,
    count
  }
}
