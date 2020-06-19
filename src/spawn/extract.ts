import { uniqName } from "./name";
import { progressiveWorker } from "./body/work";
import { EXTRACTOR } from "constants/role";

export function needsExtractor(spawn: StructureSpawn, extractorCount?: number) {
  if (extractorCount) return false
  const room = spawn.room
  const mem = room.memory
  if (!mem.creeps) return false
  const mineral = room.mineral
  if (!mineral || !mineral.mineralAmount || !room.extractor) return false
  return true
}

export default function extract(spawn: StructureSpawn) {
  const name = uniqName("D")
  let memory = {
    role: EXTRACTOR,
    room: spawn.room.name,
    deprivity: 0
  }
  const body = progressiveWorker(spawn.room.energyCapacityAvailable)
  const boostRequests = spawn.room.prepareBoostData(memory, [CARRY, WORK], ['capacity', 'harvest'], body)
  spawn.trySpawnCreep(body, name, memory, false, 25, boostRequests)
  return true
}
