import { progressiveWorker } from './body/work'

export function needsUpgraders(
  spawn: StructureSpawn,
  count: number,
  containersPresent: boolean,
) {
  const isLinked = spawn.room.links.finished
  const maxUpgradersCount = Memory.maxUpgradersCount || 3
  return (
    count < maxUpgradersCount &&
    containersPresent &&
    count < (spawn.room.memory.maxWorkController || 0) &&
    !isLinked
  )
}

export default function spawnUpgrader(
  spawn: StructureSpawn,
  mem: StableRoomMemory,
) {
  const parts = progressiveWorker(
    spawn.room.energyCapacityAvailable,
    mem.maxWorkController,
  )
  if (!mem.workControllerOver) mem.workControllerOver = 0
  if (spawn.room.storage) {
    const stored = spawn.room.storage.store[RESOURCE_ENERGY]
    if (
      stored >
      (4 + mem.workControllerOver) * CREEP_LIFE_TIME * UPGRADE_CONTROLLER_POWER
    ) {
      mem.maxWorkController++
      mem.workControllerOver++
    } else if (stored < 500 && mem.maxWorkController > 1) {
      mem.maxWorkController--
      mem.workControllerOver--
    }
  }
  const creepMemory: CreepMemoryTraits = { role: Role.UPGRADER }
  const boostRequests = spawn.room.boosts.prepareData(
    creepMemory,
    [CARRY, WORK],
    ['capacity', 'upgradeController'],
    parts,
  )
  spawn.trySpawnCreep(parts, 'U', creepMemory, false, 100, boostRequests)
}
