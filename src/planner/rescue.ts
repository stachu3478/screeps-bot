import { MINER } from 'constants/role'
import { ARRIVE } from 'constants/state';

// TODO make it work with miners
export default function callRescue(room: Room) {
  console.log(`WARNING: No creeps in room ${room.name}!`)
  const claimer = Game.rooms[room.memory._claimer]
  if (!claimer) return
  const creeps = claimer.memory.creeps
  if (!creeps) return
  for (const name in creeps) {
    const creep = Game.creeps[name]
    if (
      creep.spawning
      || creep.getActiveBodyparts(WORK) === 0
      || creep.getActiveBodyparts(CARRY) === 0
      || creep.getActiveBodyparts(MOVE) === 0
      || !creep.ticksToLive
      || creep.ticksToLive < 1400
    ) continue
    delete creeps[name]
    if (!room.memory.creeps) room.memory.creeps = {}
    room.memory.creeps[name] = 0
    creep.memory.room = room.name
    creep.memory.role = MINER
    creep.memory._harvest = room.memory.colonySourceId
    creep.memory.state = ARRIVE
    creep.memory._arrive = room.name
    return
  }
}
