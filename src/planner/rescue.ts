import { COLONIZER, MINER } from 'constants/role'
import { progressiveMobileWorker } from 'spawn/body/work'
import { uniqName } from 'spawn/name';
import { ColonizerMemory } from 'role/colonizer';

// TODO make it work with miners
export default function callRescue(room: Room) {
  console.log(`WARNING: No creeps in room ${room.name}!`)
  const claimers = [Game.rooms[room.memory._claimer || ''] || '']
  if (room.memory._claimed) claimers.push(...room.memory._claimed.map(n => Game.rooms[n]))
  claimers.find((claimer) => {
    if (!claimer) {
      console.log('No claimer room')
      return false
    }
    const spawnName = claimer.memory.spawnName
    if (!spawnName) {
      console.log('No spawn registry in claimer room')
      return false
    }
    const spawn = Game.spawns[spawnName]
    if (!spawn) {
      console.log('No spawn in claimer room')
      return false
    }
    console.log('Try to spawn creep')
    const name = uniqName('P')
    const memory: ColonizerMemory = {
      role: COLONIZER,
      room: room.name,
      deprivity: 0,
      _arrive: room.name,
      _targetRole: MINER
    }
    const result = spawn.spawnCreep(progressiveMobileWorker(Math.max(spawn.room.energyAvailable, SPAWN_ENERGY_START)), name, {
      memory
    })
    if (result === ERR_BUSY) {
      console.log('Spawn is busy', JSON.stringify(spawn))
      return false
    }
    room.memory.creeps = { [name]: 0 }
    return true
  })
  console.log('No spawn found')
}
