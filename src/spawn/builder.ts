import { progressiveWorker } from './body/work'

export function needsBuilder(spawn: StructureSpawn, buildersCount?: number) {
  if (buildersCount) return false
  return (
    spawn.room.buildingRouter.hasJob() || spawn.room.repairRouter.hasJob(true)
  )
}

export default function spawnBuilder(spawn: StructureSpawn) {
  let memory = { role: Role.BUILDER }
  const body = progressiveWorker(spawn.room.energyCapacityAvailable)
  const boostRequests = spawn.room.boosts.prepareData(
    memory,
    [CARRY, WORK],
    ['capacity', 'build'],
    body,
  )
  spawn.trySpawnCreep(body, 'B', memory, false, 25, boostRequests)
  return true
}
