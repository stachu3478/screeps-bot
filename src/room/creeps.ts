import { HARVESTER, UPGRADER, CLAIMER, SCOUT, COMMANDER, MINER, RETIRED, EXTRACTOR, FIGHTER, STATIC_UPGRADER, COLONIZER } from '../constants/role'
import roleHarvester from '../role/harvester'
import roleUpgrader from '../role/upgrader'
import roleClaimer, { Claimer } from '../role/claimer'
import roleScout, { Scout } from '../role/scout'
import commander from '../role/commander'
import miner from 'role/miner';
import isRetired from 'utils/retired';
import extractor from 'role/extractor';
import fighter from 'role/fighter';
import staticUpgrader from '../role/staticUpgrader';
import colonizer, { Colonizer } from 'role/colonizer';

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
      creepCountByRole[role] = (creepCountByRole[role] || 0) + 1
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
