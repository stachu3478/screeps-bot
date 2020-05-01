import { progressiveClaimer, progressiveCommander } from './body'
import { CLAIMER, SCOUT, COMMANDER } from 'constants/role';
import { uniqName } from './name'
import { infoStyle } from '../room/style'

function autoClaim(spawn: StructureSpawn, creepCountByRole: number[]) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (spawn.room.energyCapacityAvailable < BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]) return false
  if (Object.keys(Memory.myRooms).length >= Game.gcl.level) return false
  if (spawn.room.memory._claim) {
    if (!creepCountByRole[CLAIMER]) {
      const name = uniqName("C")
      spawn.spawnCreep(progressiveClaimer(spawn.room.energyCapacityAvailable), name, { memory: { role: CLAIMER, room: spawn.room.name } })
      mem.creeps[name] = 0
      spawn.room.visual.text("Try to spawn claimer.", 0, 3, infoStyle)
      return true
    }
  } else if (!creepCountByRole[SCOUT]) {
    const name = uniqName("S")
    spawn.spawnCreep([MOVE], name, { memory: { role: SCOUT, room: spawn.room.name } })
    mem.creeps[name] = 0
    spawn.room.visual.text("Try to spawn scout.", 0, 3, infoStyle)
    return true
  }
  return false
}

export default function domination(spawn: StructureSpawn, creepCountByRole: number[]) {
  const mem = spawn.room.memory
  if (!mem.creeps) mem.creeps = {}
  if (autoClaim(spawn, creepCountByRole)) return
  if (!mem._attack) return
  const name = uniqName("X")
  spawn.spawnCreep(progressiveCommander(spawn.room.energyCapacityAvailable, 3), name, { memory: { role: COMMANDER, room: spawn.room.name } })
  spawn.room.visual.text("Try to spawn commander.", 0, 3, infoStyle)
  mem.creeps[name] = 0
}
