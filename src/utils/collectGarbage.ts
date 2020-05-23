export default function collectGarbage(name: string) {
  const mem = Memory.creeps[name]
  if (!mem) return
  const room = Memory.rooms[mem.room]
  if (!room) return
  const roomCreeps = room.creeps
  if (roomCreeps) delete roomCreeps[name]
  delete Memory.creeps[name]
}
