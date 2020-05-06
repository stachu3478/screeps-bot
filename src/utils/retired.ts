export default function isRetired(creep: Creep) {
  return (creep.ticksToLive || 0) <= creep.body.length * CREEP_SPAWN_TIME + creep.memory.deprivity
}
