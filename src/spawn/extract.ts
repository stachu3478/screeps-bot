import { uniqName } from "./name";
import { progressiveWorker } from "./body/work";
import { EXTRACTOR } from "constants/role";
import { infoStyle } from "room/style";

export default function extract(spawn: StructureSpawn) {
  const mem = spawn.room.memory
  if (!mem._mineral || !mem.creeps || !mem._extractor) return false
  const mineral = Game.getObjectById(mem._mineral)
  if (!mineral || !mineral.mineralAmount) return false
  const name = uniqName("D")
  const result = spawn.spawnCreep(progressiveWorker(spawn.room.energyCapacityAvailable), name, { memory: { role: EXTRACTOR, room: spawn.room.name, deprivity: 0 } })
  if (result === 0) mem.creeps[name] = 0
  else spawn.room.visual.text("Try to spawn extractor.", 0, 3, infoStyle)
  return true
}
