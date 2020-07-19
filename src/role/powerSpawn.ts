export default function powerSpawn(spawn: StructurePowerSpawn) {
  const cache = spawn.cache
  if (cache.idle) return
  if (spawn.processPower() === OK) return
  cache.idle = 1
  spawn.room.cache.priorityFilled = 0
}
