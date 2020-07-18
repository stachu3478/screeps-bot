export default function powerSpawn(spawn: StructurePowerSpawn) {
  const roomMemory = spawn.room.memory
  if (roomMemory[Keys.powerSpawnIdle]) return
  if (spawn.processPower() === OK) return
  roomMemory[Keys.powerSpawnIdle] = 1
  roomMemory.priorityFilled = 0
}
