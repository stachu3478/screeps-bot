import { progressiveStaticUpgrader } from './body/work'
import { energyToUpgradeThreshold } from 'config/storage'

export function needsStaticUpgraders(spawn: StructureSpawn, count: number) {
  if (count || !spawn.room.linked) return false
  const controller = spawn.room.controller
  if (!controller) return false // xd?
  if (controller.level < 8) return true
  return (
    controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[controller.level] / 2
  )
}

export default function spawnStaticUpgrader(
  spawn: StructureSpawn,
  controller: StructureController,
) {
  const room = spawn.room
  const parts = progressiveStaticUpgrader(
    room.energyCapacityAvailable,
    controller.level === 8,
    room.store(RESOURCE_ENERGY) >= energyToUpgradeThreshold ? 2 : 1,
  )
  const deprivity = spawn.distanceToController
  const creepMemory: CreepMemory = {
    role: Role.STATIC_UPGRADER,
    room: room.name,
    deprivity,
  }
  const boostRequests = room.boosts.prepareData(
    creepMemory,
    [CARRY, WORK],
    ['capacity', 'upgradeController'],
    parts,
  )
  spawn.trySpawnCreep(parts, 'U', creepMemory, false, 100, boostRequests)
}
