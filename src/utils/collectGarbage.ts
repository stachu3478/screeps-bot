export default function collectGarbage(name: string) {
  delete global.Cache.creeps[name]
  const mem = Memory.creeps[name]
  if (!mem) return
  delete Memory.creeps[name]
  const room = Memory.rooms[mem.room]
  if (!room) return
  const roomCreeps = room.creeps
  if (roomCreeps) delete roomCreeps[name]
}

export function collectGarbageAll() {
  for (const name in Memory.creeps) if (!Game.creeps[name]) collectGarbage(name)
}
