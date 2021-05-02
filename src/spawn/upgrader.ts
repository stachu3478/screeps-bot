import { progressiveWorker, progressiveStaticUpgrader } from './body/work'
import { energyToUpgradeThreshold } from 'config/storage'

export function needsUpgraders(
  spawn: StructureSpawn,
  count: number,
  containersPresent: boolean,
) {
  const isLinked = spawn.room.linked
  const maxUpgradersCount = Memory.maxUpgradersCount || 3
  return (
    !isLinked &&
    containersPresent &&
    count < maxUpgradersCount &&
    count < (spawn.room.memory.maxWorkController || 0)
  )
  /*if (
    !result &&
    !isLinked &&
    !workPartCountByRole[Role.UPGRADER] &&
    !workPartCountByRole[Role.STATIC_UPGRADER]
  )
    console.log(
      'xd?',
      count,
      maxUpgradersCount,
      spawn.room.memory.maxWorkController,
      containersPresent,
    )*/
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
    } else if (stored < 500) {
      mem.maxWorkController--
      mem.workControllerOver--
    }
  }
  const creepMemory: CreepMemory = {
    role: Role.UPGRADER,
    room: spawn.room.name,
    deprivity: 0,
  }
  const boostRequests = spawn.room.prepareBoostData(
    creepMemory,
    [CARRY, WORK],
    ['capacity', 'upgradeController'],
    parts,
  )
  spawn.trySpawnCreep(parts, 'U', creepMemory, false, 100, boostRequests)
}
