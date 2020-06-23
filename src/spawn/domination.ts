import { progressiveClaimer, progressiveCommander } from './body/body'
import Role from 'constants/role';
import { uniqName } from './name'
import { infoStyle } from '../room/style'

function autoClaim(spawn: StructureSpawn, creepCountByRole: number[]) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (spawn.room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]) return false
  if (Object.keys(Memory.myRooms).length >= Game.gcl.level) return false
  if (spawn.room.memory._claim) {
    if (!creepCountByRole[Role.CLAIMER]) {
      const name = uniqName("C")
      const result = spawn.trySpawnCreep(progressiveClaimer(spawn.room.energyCapacityAvailable), name, { role: Role.CLAIMER, room: spawn.room.name, deprivity: 0 }, false, 20)
      if (result === 0) mem.creeps[name] = 0
      else spawn.room.visual.text("Try to spawn claimer.", 0, 3, infoStyle)
      return true
    }
  } else if (!creepCountByRole[Role.SCOUT]) {
    const name = uniqName("S")
    const result = spawn.trySpawnCreep([MOVE], name, { role: Role.SCOUT, room: spawn.room.name, deprivity: 0 })
    if (result === 0) mem.creeps[name] = 0
    else spawn.room.visual.text("Try to spawn scout.", 0, 3, infoStyle)
    return true
  }
  return false
}

export default function domination(spawn: StructureSpawn, creepCountByRole: number[]) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (!mem._attack) return autoClaim(spawn, creepCountByRole)
  const name = uniqName("X")
  const memory = { role: Role.COMMANDER, room: spawn.room.name, deprivity: 0 }
  const body = progressiveCommander(spawn.room.energyCapacityAvailable, mem._attackLevel || 3)
  const boostRequests = spawn.room.prepareBoostData(memory, [HEAL, TOUGH], ['heal', 'damage'], body)
  const result = spawn.trySpawnCreep(body, name, memory, false, 10, boostRequests)
  if (result === 0) mem.creeps[name] = 0
  else spawn.room.visual.text("Try to spawn commander.", 0, 3, infoStyle)
  return true
}
