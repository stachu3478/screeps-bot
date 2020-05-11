import { infoStyle } from "room/style";
import { UPGRADER, STATIC_UPGRADER } from "constants/role";
import { uniqName } from "./name";
import { progressiveWorker, progressiveStaticUpgrader } from "./body/work";

export default function spawnUpgrader(spawn: StructureSpawn, mem: StableRoomMemory) {
  const name = uniqName("U")
  let parts
  let role
  let deprivity
  if (mem._linked) {
    parts = progressiveStaticUpgrader(spawn.room.energyCapacityAvailable)
    role = STATIC_UPGRADER
    deprivity = spawn.pos.findPathTo(spawn.room.controller as StructureController).length
  } else {
    parts = progressiveWorker(spawn.room.energyCapacityAvailable, mem.maxWorkController)
    role = UPGRADER
    deprivity = 0
    if (!mem.workControllerOver) mem.workControllerOver = 0
    if (spawn.room.storage) {
      const stored = spawn.room.storage.store[RESOURCE_ENERGY]
      if (stored > (4 + mem.workControllerOver) * CREEP_LIFE_TIME * UPGRADE_CONTROLLER_POWER) {
        mem.maxWorkController++
        mem.workControllerOver++
      } else if (stored < 500) {
        mem.maxWorkController--
        mem.workControllerOver--
      }
    }
  }
  const result = spawn.spawnCreep(parts, name, { memory: { role, room: spawn.room.name, deprivity } })
  if (result === 0) mem.creeps[name] = 0
  else spawn.room.visual.text("Try to spawn upgrader.", 0, 3, infoStyle)
}
