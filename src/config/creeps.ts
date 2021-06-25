import colonizer from 'role/creep/colonizer'
import hauler from 'role/creep/hauler'
import roleHarvester from '../role/creep/harvester'
import roleClaimer from '../role/creep/military/claimer'
import commander from '../role/creep/military/commander'
import roleScout from '../role/creep/military/scout'
import miner from 'role/creep/miner'
import roleUpgrader from '../role/creep/upgrader'
import extractor from 'role/creep/extractor'
import fighter from 'role/creep/military/fighter'
import staticUpgrader from '../role/creep/staticUpgrader'
import factoryManager from 'role/creep/factoryManager'
import labManager from 'role/creep/labManager'
import roleBooster from 'role/creep/booster'
import ranger from 'role/creep/military/ranger'
import mover from 'role/creep/mover'
import builder from 'role/creep/builder'
import depositMiner from 'role/creep/depositMiner'
import remoteMiner from 'role/creep/remoteMiner'
import collector from 'role/creep/collector'
import defender from 'role/creep/military/defender'
import reserver from 'role/creep/military/reserver'
import recycle from 'routine/recycle'

function recycleIfNoEkchaust(creep: Creep) {
  if (!creep.motherRoom.memory[RoomMemoryKeys.ekhaust]) {
    recycle(creep)
  }
}

export const roleBinding: {
  [R in Role]: ((c: RoleCreep<R>) => void) | undefined
} = {
  [Role.HARVESTER]: roleHarvester,
  [Role.UPGRADER]: roleUpgrader,
  [Role.STATIC_UPGRADER]: staticUpgrader,
  [Role.SCOUT]: roleScout,
  [Role.CLAIMER]: roleClaimer,
  [Role.COMMANDER]: commander,
  [Role.MINER]: miner,
  [Role.REMOTE_MINER]: remoteMiner,
  [Role.COLLECTOR]: collector,
  [Role.EXTRACTOR]: extractor,
  [Role.FIGHTER]: fighter,
  [Role.COLONIZER]: colonizer,
  [Role.FACTORY_MANAGER]: factoryManager,
  [Role.LAB_MANAGER]: labManager,
  [Role.HAULER]: hauler,
  [Role.BOOSTER]: roleBooster.run,
  [Role.MOVE_TO_FLAG]: (c: Creep) => c.moveTo(Game.flags['flag']),
  [Role.RANGER]: ranger,
  [Role.MOVER]: mover,
  [Role.BUILDER]: builder,
  [Role.DEPOSIT_MINER]: depositMiner,
  [Role.DEFENDER]: defender,
  [Role.RESERVER]: reserver,
  [Role.TOWER_EKHAUSTER]: recycleIfNoEkchaust,
  [Role.DESTROYER]: recycleIfNoEkchaust,
  [Role.DUAL]: () => {},
  [Role.RETIRED]: () => {},
}
