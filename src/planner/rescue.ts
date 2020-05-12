import { COLONIZER, MINER } from 'constants/role'
import { progressiveMobileWorker } from 'spawn/body/work'
import { uniqName } from 'spawn/name';
import { ColonizerMemory } from 'role/colonizer';

// TODO make it work with miners
export default function callRescue(room: Room) {
  console.log(`WARNING: No creeps in room ${room.name}!`)
  const claimer = Game.rooms[room.memory._claimer]
  if (!claimer) return console.log('No claimer room')
  const spawnName = claimer.memory.spawnName
  if (!spawnName) return console.log('No spawn registry in claimer room')
  const spawn = Game.spawns[spawnName]
  if (!spawn) return console.log('No spawn in claimer room')
  console.log('Try to spawn creep')
  const name = uniqName('P')
  const result = spawn.spawnCreep(progressiveMobileWorker(Math.max(spawn.room.energyAvailable, SPAWN_ENERGY_START)), name, {
    memory: {
      role: COLONIZER,
      room: room.name,
      deprivity: 0,
      _arrive: room.name,
      _targetRole: MINER
    } as ColonizerMemory
  })
  if (result === ERR_BUSY) return console.log('Spawn is busy', JSON.stringify(spawn))
  room.memory.creeps = { [name]: 0 }
}
