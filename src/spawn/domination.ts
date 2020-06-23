import { progressiveClaimer, progressiveCommander } from './body/body'
import Role from 'constants/role'

function autoClaim(spawn: StructureSpawn, creepCountByRole: number[]) {
  if (spawn.room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]) return false
  if (Object.keys(Memory.myRooms).length >= Game.gcl.level) return false
  if (spawn.room.memory._claim) {
    if (!creepCountByRole[Role.CLAIMER]) {
      spawn.trySpawnCreep(progressiveClaimer(spawn.room.energyCapacityAvailable), 'C', { role: Role.CLAIMER, room: spawn.room.name, deprivity: 0 }, false, 20)
      return true
    }
  } else if (!creepCountByRole[Role.SCOUT]) {
    spawn.trySpawnCreep([MOVE], 'S', { role: Role.SCOUT, room: spawn.room.name, deprivity: 0 })
    return true
  }
  return false
}

export default function domination(spawn: StructureSpawn, creepCountByRole: number[]) {
  const mem = spawn.room.memory
  if (!mem._attack) return autoClaim(spawn, creepCountByRole)
  const memory = { role: Role.COMMANDER, room: spawn.room.name, deprivity: 0 }
  const body = progressiveCommander(spawn.room.energyCapacityAvailable, mem._attackLevel || 3)
  const boostRequests = spawn.room.prepareBoostData(memory, [HEAL, TOUGH], ['heal', 'damage'], body)
  spawn.trySpawnCreep(body, 'S', memory, false, 10, boostRequests)
  return true
}
