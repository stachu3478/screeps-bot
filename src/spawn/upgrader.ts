import { UPGRADER, STATIC_UPGRADER, BOOSTER } from "constants/role";
import { uniqName } from "./name";
import { progressiveWorker, progressiveStaticUpgrader } from "./body/work";

export default function spawnUpgrader(spawn: StructureSpawn, mem: StableRoomMemory, controller: StructureController) {
  const name = uniqName("U")
  let parts
  let role
  let deprivity
  if (mem._linked) {
    parts = progressiveStaticUpgrader(spawn.room.energyCapacityAvailable)
    role = STATIC_UPGRADER
    deprivity = spawn.pos.findPathTo(controller).length
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
  const carryBoostInfo = spawn.room.getBestAvailableBoost('carry', 'capacity', 1)
  const upgradeBoostInfo = spawn.room.getBestAvailableBoost('work', 'upgradeController', parts.filter(type => type === WORK).length)
  const boostRequests: BoostInfo[] = []
  if (carryBoostInfo) boostRequests.push(carryBoostInfo)
  if (upgradeBoostInfo) boostRequests.push(upgradeBoostInfo)
  const creepMemory: CreepMemory = { role, room: spawn.room.name, deprivity }
  if (boostRequests.length) {
    creepMemory.boosting = 1
    creepMemory._targetRole = creepMemory.role
    creepMemory.role = BOOSTER
  }
  spawn.trySpawnCreep(parts, name, creepMemory, false, 100, boostRequests)
}
