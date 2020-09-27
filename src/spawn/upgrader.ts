import { progressiveWorker, progressiveStaticUpgrader } from './body/work'

export default function spawnUpgrader(
  spawn: StructureSpawn,
  mem: StableRoomMemory,
  controller: StructureController,
) {
  let parts
  let role
  let deprivity
  if (spawn.room.linked) {
    parts = progressiveStaticUpgrader(
      spawn.room.energyCapacityAvailable,
      controller.level == 8,
    )
    role = Role.STATIC_UPGRADER
    deprivity = spawn.pos.findPathTo(controller).length
  } else {
    parts = progressiveWorker(
      spawn.room.energyCapacityAvailable,
      mem.maxWorkController,
    )
    role = Role.UPGRADER
    deprivity = 0
    if (!mem.workControllerOver) mem.workControllerOver = 0
    if (spawn.room.storage) {
      const stored = spawn.room.storage.store[RESOURCE_ENERGY]
      if (
        stored >
        (4 + mem.workControllerOver) *
          CREEP_LIFE_TIME *
          UPGRADE_CONTROLLER_POWER
      ) {
        mem.maxWorkController++
        mem.workControllerOver++
      } else if (stored < 500) {
        mem.maxWorkController--
        mem.workControllerOver--
      }
    }
  }
  const creepMemory: CreepMemory = { role, room: spawn.room.name, deprivity }
  const boostRequests = spawn.room.prepareBoostData(
    creepMemory,
    [CARRY, WORK],
    ['capacity', 'upgradeController'],
    parts,
  )
  spawn.trySpawnCreep(parts, 'U', creepMemory, false, 100, boostRequests)
}
