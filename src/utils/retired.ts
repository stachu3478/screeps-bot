export default function isRetired(creep: Creep) {
  return (creep.ticksToLive || CREEP_LIFE_TIME) <= creep.body.length * CREEP_SPAWN_TIME + creep.memory.deprivity
}
