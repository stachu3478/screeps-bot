import { progressiveClaimer, progressiveCommander } from './body'
import { CLAIMER, SCOUT, COMMANDER } from 'constants/role';

function uniqName() {
  let time = 0
  while (Game.creeps['Stan' + time]) time++
  return 'Stan' + time
}

function autoClaim(spawn: StructureSpawn, creepCountByRole: number[]) {
  let mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (spawn.room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]) return false
  if (Object.keys(Memory.myRooms).length >= Game.gcl.level) return false
  if (spawn.room.memory._claim) {
    if (!creepCountByRole[CLAIMER]) {
      const name = uniqName()
      spawn.spawnCreep(progressiveClaimer(spawn.room.energyCapacityAvailable), uniqName(), { memory: { role: CLAIMER, room: spawn.room.name } })
      mem.creeps[name] = 0
      return true
    }
  } else if (!creepCountByRole[SCOUT]) {
    const name = uniqName()
    spawn.spawnCreep([MOVE], uniqName(), { memory: { role: SCOUT, room: spawn.room.name } })
    mem.creeps[name] = 0
    return true
  }
  return false
}

export default function domination(spawn: StructureSpawn, creepCountByRole: number[]) {
  let mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (autoClaim(spawn, creepCountByRole)) return
  if (!spawn.room.memory._attack) return
  const name = uniqName()
  spawn.spawnCreep(progressiveCommander(spawn.room.energyCapacityAvailable, 3), uniqName(), { memory: { role: COMMANDER, room: spawn.room.name } })
  mem.creeps[name] = 0
}
