import { infoStyle } from "room/style";
import { MINER } from "constants/role";

export default function trySpawnCreep(body: BodyPartConstant[], name: string, memory: CreepMemory, spawn: StructureSpawn, retry: boolean = false, cooldown: number = 100) {
  const result = spawn.spawnCreep(body, name, { memory, directions: spawn.getDirections() })
  const mem = spawn.room.memory as StableRoomMemory
  if (result !== 0) {
    if (!retry) spawn.memory.trySpawn = {
      creep: body,
      name,
      memory,
      cooldown
    }
  } else {
    mem.priorityFilled = 0
    mem.creeps[name] = 0
    if (memory.role === MINER) mem.colonySources[spawn.memory.spawnSourceId || ''] = mem.colonySources[spawn.memory.spawnSourceId || ''].slice(0, 2) + name
    delete spawn.memory.spawnSourceId
    delete spawn.memory.trySpawn
  }
  spawn.room.visual.text("Try to spawn " + name, 0, 3, infoStyle)
  return result
}
