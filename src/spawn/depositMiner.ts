import remoteMining from 'config/remoteMining'
import _ from 'lodash'
import { progressiveDepositMiner } from './body/work'

export function needsDepositMiner(spawn: StructureSpawn, count: number) {
  const depositTraits = spawn.room.depositPlanner
  return (
    depositTraits.deposit &&
    depositTraits.cost <= remoteMining.deposits.maxCost &&
    depositTraits.coverage > count && // todo fix coverage
    spawn.room.energyAvailable === spawn.room.energyCapacityAvailable
  )
}

export function spawnDepositMiner(spawn: StructureSpawn) {
  const depositTraits = spawn.room.depositPlanner
  const cost = depositTraits.cost
  const parts = progressiveDepositMiner(
    spawn.room.energyCapacityAvailable,
    cost,
    depositTraits.lastCooldown,
  )
  const memory: CreepMemoryTraits = {
    role: Role.DEPOSIT_MINER,
    deprivity: cost,
  }
  spawn.trySpawnCreep(parts, 'I', memory)
}
