import _ from 'lodash'
import profiler from 'screeps-profiler'
import { progressiveMiner, progressiveLiteWorker } from './body/work'
import { progressiveFighter } from './body/body'
import domination from './domination'
import { infoStyle } from '../room/style'
import extract, { needsExtractor } from './extract'
import spawnUpgrader, { needsUpgraders } from './upgrader'
import { MinerMemory, Miner } from 'role/creep/miner'
import { findContainers } from 'utils/find'
import { needsRanger, spawnRanger } from './ranger'
import { needsScout, spawnScout, needsClaim } from './scout'
import { needsClaimer, spawnClaimer } from './claimer'
import { needsScorer, spawnScorer } from './scorer'
import { needsHauler, spawnHauler } from './hauler'
import { needsScoreDigger, spawnScoreDigger } from './scoreDigger'
import { needsMover, spawnMover } from './mover'
import spawnStaticUpgrader, { needsStaticUpgraders } from './staticUpgrader'

export default profiler.registerFN(function loop(
  spawn: StructureSpawn,
  controller: StructureController,
  creepCountByRole: number[],
  workPartCountByRole: number[],
  needsFighters: boolean,
) {
  const mem = spawn.room.memory
  const cache = spawn.cache
  if (!mem.creeps) mem.creeps = {}
  if (mem.maxWorkController === undefined) return
  const max = mem.sourceCount || 0
  if (spawn.room.energyAvailable < spawn.room.energyCapacityAvailable)
    spawn.room.cache.priorityFilled = 0
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
  const containersPresent = !!(
    findContainers(spawn.room).length || spawn.room.storage
  )
  if (minerCount === 0 && !creepCountByRole[Role.RETIRED]) {
    const colonySource = mem.colonySourceId
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
  } else if (harvesterCount === 0 && containersPresent) {
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
  } else if (needsFighters) {
    spawn.trySpawnCreep(
      progressiveFighter(
        Math.max(SPAWN_ENERGY_START, spawn.room.energyAvailable),
      ),
      'F',
      {
        role: Role.FIGHTER,
        room: spawn.room.name,
        deprivity: 0,
      },
    )
  } else if (minerCount < max) {
    const parts = progressiveMiner(spawn.room.energyCapacityAvailable)
    const freeSource = controller.room.sources.free
    if (!freeSource) return
    cache.sourceId = freeSource as Id<Source>
    const spec = controller.room.sources.getDistance(freeSource)
    const memory: MinerMemory = {
      role: Role.MINER,
      room: spawn.room.name,
      _harvest: freeSource as Id<Source>,
      deprivity: spec,
    }
    spawn.trySpawnCreep(parts, 'M', memory)
  } else if (
    needsUpgraders(
      spawn,
      creepCountByRole[Role.UPGRADER] || 0,
      containersPresent,
    )
  ) {
    spawnUpgrader(spawn, mem as StableRoomMemory)
  } else if (
    needsStaticUpgraders(spawn, creepCountByRole[Role.STATIC_UPGRADER] || 0)
  ) {
    spawnStaticUpgrader(spawn, controller)
  } else if (needsHauler(spawn, creepCountByRole[Role.HAULER])) {
    spawnHauler(spawn)
  } else if (needsScout(spawn, creepCountByRole[Role.SCOUT])) {
    spawnScout(spawn)
  } else if (needsClaimer(spawn, creepCountByRole[Role.CLAIMER])) {
    spawnClaimer(spawn)
  } else if (domination(spawn, creepCountByRole))
    spawn.room.visual.text(
      '                            in domination',
      0,
      3,
      infoStyle,
    )
  else if (needsExtractor(spawn, creepCountByRole[Role.EXTRACTOR]))
    extract(spawn)
  else if (needsRanger(spawn, creepCountByRole[Role.RANGER])) spawnRanger(spawn)
  else if (needsScorer(spawn, creepCountByRole[Role.SCORER])) spawnScorer(spawn)
  else if (needsScoreDigger(spawn, creepCountByRole[Role.SCORE_DIGGER]))
    spawnScoreDigger(spawn)
  else if (needsMover(spawn, creepCountByRole[Role.MOVER])) spawnMover(spawn)
  else spawn.room.visual.text('Spawn is idle.', 0, 3, infoStyle)
},
'spawnLoop')
