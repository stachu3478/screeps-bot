import roleHarvester from '../role/creep/harvester'
import roleUpgrader from '../role/creep/upgrader'
import roleClaimer, { Claimer } from '../role/creep/claimer'
import roleScout, { Scout } from '../role/creep/scout'
import commander, { Commander } from '../role/creep/commander'
import miner from 'role/creep/miner'
import extractor from 'role/creep/extractor'
import fighter from 'role/creep/fighter'
import staticUpgrader from '../role/creep/staticUpgrader'
import colonizer, { Colonizer } from 'role/creep/colonizer'
import factoryManager from 'role/creep/factoryManager'
import labManager from 'role/creep/labManager'
import hauler from 'role/creep/hauler'
import roleBooster, { BoosterCreep } from 'role/creep/booster'
import Harvester from 'role/creep/harvester.d'
import collectGarbage from 'utils/collectGarbage'
import ranger, { Ranger } from 'role/creep/ranger'
import mover from 'role/creep/mover'
import builder from 'role/creep/builder'
import towerEkhauster from 'role/creep/towerEkhauster'

interface Creeps {
  [key: string]: 0
}

export default function creeps(
  creeps: Creeps,
  room: Room,
  enemy?: Creep,
  holdFire?: boolean,
) {
  const creepCountByRole: number[] = []
  let count = 0
  for (const name in creeps) {
    const creep = Game.creeps[name]
    if (!creep) {
      collectGarbage(name)
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
    if (!creep.isRetired) {
      if (role === Role.BOOSTER) {
        const targetRole = creep.memory._targetRole || 0
        creepCountByRole[targetRole] = (creepCountByRole[targetRole] || 0) + 1
      } else creepCountByRole[role] = (creepCountByRole[role] || 0) + 1
      count++
    } else
      creepCountByRole[Role.RETIRED] = (creepCountByRole[Role.RETIRED] || 0) + 1
    if (creep.spawning) continue
    try {
      switch (creep.memory.role) {
        case Role.HARVESTER:
          roleHarvester(creep as Harvester)
          break
        case Role.UPGRADER:
          roleUpgrader(creep)
          break
        case Role.STATIC_UPGRADER:
          staticUpgrader(creep)
          break
        case Role.SCOUT:
          roleScout(creep as Scout)
          break
        case Role.CLAIMER:
          roleClaimer(creep as Claimer)
          break
        case Role.COMMANDER:
          commander(creep as Commander)
          break
        case Role.MINER:
          miner(creep)
          break
        case Role.EXTRACTOR:
          extractor(creep)
          break
        case Role.FIGHTER:
          fighter(creep, enemy, holdFire)
          break
        case Role.COLONIZER:
          colonizer(creep as Colonizer)
          break
        case Role.FACTORY_MANAGER:
          factoryManager(creep)
          break
        case Role.LAB_MANAGER:
          labManager(creep)
          break
        case Role.HAULER:
          hauler(creep)
          break
        case Role.BOOSTER:
          roleBooster.run(creep as BoosterCreep)
          break
        case Role.MOVE_TO_FLAG:
          creep.moveTo(Game.flags['flag'])
          break
        case Role.RANGER:
          ranger(creep as Ranger)
          break
        case Role.MOVER:
          mover(creep)
          break
        case Role.BUILDER:
          builder(creep)
          break
        case Role.TOWER_EKHAUSTER:
          towerEkhauster(creep)
          break
        default:
          creep.memory.role = Role.UPGRADER
      }
    } catch (err) {
      console.log(err.message, err.stack)
    }
    creep.memory.r = creep.room.name
    creep.memory.l = creep.ticksToLive
  }

  return {
    creepCountByRole,
    count,
  }
}
