import ClaimPlanner from 'planner/military/ClaimPlanner'

function handleRoomBlackList(memory: CreepMemory) {
  const room = Game.rooms[memory.r || '']
  if (!room || room.my) return
  const motherRoom = Game.rooms[memory.room]
  if (!motherRoom) return
  if (motherRoom.memory._haul === room.name) {
    delete motherRoom.memory._haul
    delete motherRoom.memory._haulSize
  }
}

function handleClaimerDeadthBeforeClaiming(mem: CreepMemory) {
  if (mem.role !== Role.CLAIMER) return
  const claimPlanner = ClaimPlanner.instance
  if (mem[Keys.lastRoom] === claimPlanner.target?.target) return
  claimPlanner.claimerDeaths++
}

export default function collectGarbage(name: string) {
  delete global.Cache.creeps[name]
  if (!Memory.creeps) {
    Memory.creeps = {}
    return
  }
  const mem = Memory.creeps[name]
  if (!mem) return
  handleRoomBlackList(mem)
  handleClaimerDeadthBeforeClaiming(mem)
  delete Memory.creeps[name]
  const room = Memory.rooms[mem.room]
  if (!room) return
  const roomCreeps = room.creeps
  if (roomCreeps) delete roomCreeps[name]
}

export function collectGarbageAll() {
  for (const name in Memory.creeps) if (!Game.creeps[name]) collectGarbage(name)
}
