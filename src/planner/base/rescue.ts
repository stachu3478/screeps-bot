import { progressiveMobileWorker } from 'spawn/body/work'

export default function callRescue(room: Room) {
  console.log(`WARNING: No creeps in room ${room.name}!`)
  const claimers = [Game.rooms[room.memory._claimer || ''] || '']
  if (room.memory._claimed)
    claimers.push(...room.memory._claimed.map((n) => Game.rooms[n]))
  claimers.find((claimer) => {
    if (!claimer) {
      console.log('No claimer room')
      return false
    }
    const spawn = claimer.find(FIND_MY_SPAWNS).find((s) => !s.spawning)
    if (!spawn) {
      console.log('No spawn in claimer room')
      return false
    }
    console.log('Try to spawn creep')
    const memory: CreepMemory = {
      role: Role.COLONIZER,
      room: room.name,
      deprivity: 0,
      newRole: Role.MINER,
    }
    const body = progressiveMobileWorker(
      Math.max(spawn.room.energyAvailable, SPAWN_ENERGY_START),
    )
    const result = spawn.trySpawnCreep(body, 'P', memory, false, 10)
    if (result === ERR_BUSY) {
      console.log('Spawn is busy', JSON.stringify(spawn))
      return false
    }
    return true
  })
  console.log('No spawn found')
}
