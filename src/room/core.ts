import _ from 'lodash'
import tower from '../role/tower'
import spawnLoop, { spawnClassRoleBinding } from 'spawn/core'
import callRescue from 'planner/base/rescue'
import usage from './usage'
import handleLog from './log'
import creeps from './creeps'
import terminal from 'role/terminal'
import { findDamagedCreeps } from 'utils/find'
import lab from 'role/lab'
import factory from 'role/factory'
import rolePowerSpawn from 'role/powerSpawn'
import EnemyPicker from './military/EnemyPicker'
import move from 'utils/path'
import ProfilerPlus from 'utils/ProfilerPlus'
import RoomStructuresPlanner from 'planner/base/RoomStructuresPlanner'

function probabilisticallyMoveCreepsOutOfSpawn(
  pos: RoomPosition,
  spawning: Spawning,
) {
  if (Math.random() < 0.5) {
    return true
  }
  return spawning.directions.some((d) => {
    return pos
      .offset(d)
      ?.lookFor(LOOK_CREEPS)
      .some((c) => c.my && move.anywhere(c, d))
  })
}

function preventSpawnBlocking(s: StructureSpawn, spawning: Spawning) {
  if (spawning.remainingTime) return
  if (spawning.directions.some((d) => s.pos.offset(d)?.walkable)) return
  if (!probabilisticallyMoveCreepsOutOfSpawn(s.pos, spawning)) {
    spawning.cancel()
    console.log('Spawning creep at ' + s.pos + ' cancelled')
  }
}

function maintainSpawns(spawns: StructureSpawn[]) {
  spawns.forEach((s) => {
    const spawning = s.spawning
    if (!spawning) return
    const creep = Game.creeps[spawning.name]
    spawnClassRoleBinding[creep.memory.role]?.spawning(s)
    preventSpawnBlocking(s, spawning)
  })
}

export default ProfilerPlus.instance.overrideFn(function run(
  controller: StructureController,
  cpuUsed: number,
) {
  const room = controller.room
  if (!room.memory.roads) {
    new RoomStructuresPlanner(room, controller.pos).run()
  }

  const mem = room.memory
  const cache = room.cache
  if (!mem.creeps) mem.creeps = {}

  const enemyPicker = new EnemyPicker(room)
  enemyPicker.fetch()
  let enemy: AnyCreep | undefined
  let needFighters = false
  let shouldAttack = false
  let towersProcessed = false
  const towers = room.buildings.towers
  if (enemyPicker.any) {
    enemy = enemyPicker.enemy!
    const canDeal = enemyPicker.dealt > 0
    shouldAttack = room.defencePolicy.shouldAttack(canDeal)
    needFighters = enemyPicker.maxDealable <= 0
    if (shouldAttack) {
      towers.forEach((t) => tower(t, enemy))
      towersProcessed = true
    }
    room.visual.enemy(enemyPicker, shouldAttack, room.defencePolicy)
    cache.healthy = 0
  } else {
    room.defencePolicy.reset()
  }
  if (!cache.healthy && !towersProcessed) {
    const creeps = findDamagedCreeps(room)
    if (creeps.length)
      towers.forEach((t) => tower(t, creeps[_.random(0, creeps.length - 1)]))
    else cache.healthy = 1
  }
  cache.scoutsWorking = 0

  const { creepCountByRole, count } = creeps(
    mem.creeps,
    room,
    enemy,
    needFighters,
  )

  handleLog(cache, controller)

  const spawns = room.find(FIND_MY_SPAWNS)
  maintainSpawns(spawns)
  if (!spawns.length) {
    if (count === 0 && !creepCountByRole[Role.RETIRED]) callRescue(room)
    const sites = room.find(FIND_CONSTRUCTION_SITES)
    const spawnSite = sites.filter(
      (s) => s.structureType === STRUCTURE_SPAWN,
    )[0]
    if (!spawnSite) {
      sites.forEach((s) => s.remove())
      if (room.memory.structs) {
        const pos = room.memory.structs.charCodeAt(1)
        room.createConstructionSite(pos & 63, pos >> 6, STRUCTURE_SPAWN)
      }
    }
  }

  if (room.terminal) terminal(room.terminal)
  lab(room)

  const factoryStructure = room.buildings.factory
  if (factoryStructure) factory(factoryStructure)

  const powerSpawn = room.buildings.powerSpawn
  if (powerSpawn) rolePowerSpawn(powerSpawn)

  controller.room.enemyDetector.scan()

  const spawn = spawns.find((s) => !s.spawning)
  if (spawn) spawnLoop(spawn, controller, creepCountByRole, needFighters)
  else {
    room.visual.spawnsBusy()
  }
  if (needFighters && !spawn && room.energyAvailable < SPAWN_ENERGY_START) {
    const claimer = Game.rooms[mem._claimer || '']
    if (claimer) claimer.memory._attack = room.name
  }
  room.visual.details(room, count, creepCountByRole)
  return usage(room, cpuUsed)
},
'roomCore')
