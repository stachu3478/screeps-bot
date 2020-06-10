import { uniqName } from "./name";
import { progressiveWorker } from "./body/work";
import { EXTRACTOR, BOOSTER } from "constants/role";
import { trySpawnCreep } from "./core";
import { ExtractorMemory } from "role/creep/extractor";

export default function extract(spawn: StructureSpawn) {
  const mem = spawn.room.memory
  if (!mem._mineral || !mem.creeps || !mem._extractor) return false
  const mineral = Game.getObjectById(mem._mineral)
  if (!mineral || !mineral.mineralAmount) return false
  const name = uniqName("D")
  let memory = {
    role: EXTRACTOR,
    room: spawn.room.name,
    deprivity: 0
  }
  trySpawnCreep(progressiveWorker(spawn.room.energyCapacityAvailable), name, memory, spawn, false, 25)
  return true
}
