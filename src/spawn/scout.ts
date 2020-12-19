import { progressiveClaimer, progressiveCommander } from './body/body'

const claimerThreshold = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]
export function needsClaim(spawn: StructureSpawn) {
  return (
    !spawn.room.memory._attack &&
    spawn.room.energyCapacityAvailable >= claimerThreshold &&
    global.Cache.ownedRooms < Math.min(Game.gcl.level, Memory.roomLimit || 0)
  )
}

export function needsScout(spawn: StructureSpawn, count: number) {
  return (needsClaim(spawn) || Memory.autoScout) && !count
}

export function spawnScout(spawn: StructureSpawn) {
  spawn.trySpawnCreep([ATTACK, MOVE], 'S', {
    role: Role.SCOUT,
    room: spawn.room.name,
    deprivity: 0,
  })
}
