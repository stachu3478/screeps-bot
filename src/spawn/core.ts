import { progressiveMiner, progressiveLiteWorker } from './body/work'
import domination from './domination'
import extract, { needsExtractor } from './extract'
import spawnUpgrader, { needsUpgraders } from './upgrader'
import { MinerMemory } from 'role/creep/miner'
import { findContainers } from 'utils/find'
import { needsRanger, spawnRanger } from './ranger'
import SpawnScout from './scout'
import { needsClaimer, spawnClaimer } from './claimer'
import { needsHauler, spawnHauler } from './hauler'
import { needsMover, spawnMover } from './mover'
import spawnStaticUpgrader, { needsStaticUpgraders } from './staticUpgrader'
import { needsFighters, spawnFighter } from './fighter'
import spawnBuilder, { needsBuilder } from './builder'
import { needsTowerEkhauster, spawnTowerEkhauster } from './towerEkhauster'
import { needsDestroyer, spawnDestroyer } from './destroyer'
import { needsNextMiner, spawnNextMiner } from './nextMiner'
import { needsDepositMiner, spawnDepositMiner } from './depositMiner'
import ProfilerPlus from 'utils/ProfilerPlus'
import SpawnCreep from './spawnCreep'
import SpawnRemoteMiner from './remoteMiner'
import SpawnCollector from './collector'
import _ from 'lodash'
import SpawnDefender from './defender'

const spawningClasses = [
  SpawnScout,
  SpawnDefender,
  SpawnRemoteMiner,
  SpawnCollector,
]
export const spawnClassRoleBinding: typeof SpawnCreep[] = []
spawningClasses.forEach((klass) => {
  spawnClassRoleBinding[new klass(_.find(Game.spawns)!, []).role] = klass
})
export default ProfilerPlus.instance.overrideFn(function loop(
  spawn: StructureSpawn,
  controller: StructureController,
  creepCountByRole: number[],
  needsFighter: boolean,
) {
  const cpu = Game.cpu.getUsed()
  const mem = spawn.room.memory
  const cache = spawn.cache
  if (!mem.creeps) mem.creeps = {}
  if (mem.maxWorkController === undefined) return

  if (cache.trySpawn) {
    const { creep, memory, name, cooldown, boost } = cache.trySpawn
    const result = spawn.trySpawnCreep(
      creep,
      name,
      memory,
      true,
      cooldown,
      boost,
    )
    if (result === 0) return
    if (cooldown <= 0) {
      delete cache.sourceId
      delete cache.trySpawn
    } else cache.trySpawn.cooldown--
    return
  }
  const harvesterCount =
    (creepCountByRole[Role.HARVESTER] || 0) +
    (creepCountByRole[Role.FACTORY_MANAGER] || 0) +
    (creepCountByRole[Role.LAB_MANAGER] || 0)
  const minerCount = creepCountByRole[Role.MINER] || 0
  spawn.room.cache.containersPresent = !!(
    findContainers(spawn.room).length || spawn.room.storage
  )
  if (minerCount === 0 && !creepCountByRole[Role.RETIRED]) {
    const colonySource = mem[RoomMemoryKeys.colonySourceIndex]
    cache.sourceId = colonySource
    spawn.trySpawnCreep(
      progressiveMiner(
        Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable),
      ),
      'M',
      {
        role: Role.MINER,
        room: spawn.room.name,
        _harvest: colonySource,
        deprivity: 0,
      } as MinerMemory,
    )
    console.log(`[${spawn.room.name}] Trying spawn a creep @ref`)
  } else if (harvesterCount === 0 && spawn.room.cache.containersPresent) {
    const energyDeclared = creepCountByRole[Role.RETIRED]
      ? spawn.room.energyCapacityAvailable
      : spawn.room.energyAvailable
    spawn.trySpawnCreep(
      progressiveLiteWorker(Math.max(SPAWN_ENERGY_START, energyDeclared)),
      'J',
      {
        role: Role.HARVESTER,
        room: spawn.room.name,
        deprivity: 0,
      },
    )
  } else if (needsFighters(needsFighter)) {
    spawnFighter(spawn)
  } else if (needsNextMiner(spawn, creepCountByRole[Role.MINER] || 0)) {
    spawnNextMiner(spawn)
  } else if (
    needsUpgraders(
      spawn,
      creepCountByRole[Role.UPGRADER] || 0,
      spawn.room.cache.containersPresent,
    )
  ) {
    spawnUpgrader(spawn, mem as StableRoomMemory)
  } else if (
    needsStaticUpgraders(spawn, creepCountByRole[Role.STATIC_UPGRADER] || 0)
  ) {
    spawnStaticUpgrader(spawn, controller)
  } else if (needsHauler(spawn, creepCountByRole[Role.HAULER])) {
    spawnHauler(spawn)
  } else if (needsBuilder(spawn, creepCountByRole[Role.BUILDER])) {
    spawnBuilder(spawn)
  } else if (needsClaimer(spawn, creepCountByRole[Role.CLAIMER])) {
    spawnClaimer(spawn)
  } else if (domination(spawn, creepCountByRole))
    spawn.room.visual.info('                            in domination', 0, 3)
  else if (needsExtractor(spawn, creepCountByRole[Role.EXTRACTOR]))
    extract(spawn)
  else if (needsRanger(spawn, creepCountByRole[Role.RANGER])) spawnRanger(spawn)
  else if (needsMover(spawn, creepCountByRole[Role.MOVER])) spawnMover(spawn)
  else if (needsTowerEkhauster(spawn, creepCountByRole[Role.TOWER_EKHAUSTER])) {
    spawnTowerEkhauster(spawn)
  } else if (needsDestroyer(spawn, creepCountByRole[Role.DESTROYER])) {
    spawnDestroyer(spawn)
  } else if (
    spawningClasses.some((klass) =>
      new klass(spawn, creepCountByRole).runIfNeeded(),
    )
  ) {
  } else if (
    needsDepositMiner(spawn, creepCountByRole[Role.DEPOSIT_MINER] || 0)
  )
    spawnDepositMiner(spawn)
  else
    spawn.room.visual.info(
      'Spawn is idle. (' + (Game.cpu.getUsed() - cpu).toPrecision(2) + ')',
      0,
      3,
    )
},
'spawnLoop')
