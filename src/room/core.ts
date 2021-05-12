import _ from 'lodash'
import tower from '../role/tower'
import spawnLoop from 'spawn/core'
import plan from 'planner/core'
import callRescue from 'planner/rescue'
import usage from './usage'
import { infoStyle, dangerStyle } from './style'
import handleLog from './log'
import creeps from './creeps'
import terminal from 'role/terminal'
import { findFighters, findDamagedCreeps } from 'utils/find'
import lab from 'role/lab'
import factory from 'role/factory'
import rolePowerSpawn from 'role/powerSpawn'
import RoomEnemies from './military/RoomEnemies'
import EnemyPicker from './military/EnemyPicker'

export default function run(controller: StructureController, cpuUsed: number) {
  const room = controller.room
  if (!room.memory.roads) plan(room)

  const mem = room.memory
  const cache = room.cache
  if (!mem.creeps) mem.creeps = {}

  const enemyPicker = new EnemyPicker(room)
  let enemy: Creep | undefined
  let needFighters = false
  let towersProcessed = false
  const towers = room.buildings.towers
  if (enemyPicker.any) {
    const enemy = enemyPicker.enemy!
    const canDeal = enemyPicker.dealt >= 0
    if (room.defencePolicy.shouldAttack(canDeal)) needFighters = true
    else {
      towers.forEach((t) => tower(t, enemy))
      towersProcessed = true
    }
    room.visual.text(
      `Enemy tracked: ${enemy.name} Vulnerability: ${enemyPicker.dealt}`,
      0,
      4,
      dangerStyle,
    )
    cache.healthy = 0
  } else {
    const powerEnemy = room.find(FIND_HOSTILE_POWER_CREEPS)[0]
    if (powerEnemy) {
      towers.forEach((t) => tower(t, powerEnemy))
      towersProcessed = true
    } else {
      room.defencePolicy.reset()
    }
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
    room.visual.text('All spawns busy', 0, 3, infoStyle)
    if (needFighters) {
      const claimer = Game.rooms[mem._claimer || '']
      if (claimer) claimer.memory._attack = room.name
    }
  }
  room.visual.text(
    'Population: ' +
      count +
      ' Retired: ' +
      (creepCountByRole[Role.RETIRED] || 0),
    0,
    0,
    count === 0 ? dangerStyle : infoStyle,
  )
  room.visual.text(
    'Spawns: ' + room.energyAvailable + '/' + room.energyCapacityAvailable,
    0,
    1,
    room.energyCapacityAvailable === 0 ? dangerStyle : infoStyle,
  )
  return usage(room, cpuUsed)
}
