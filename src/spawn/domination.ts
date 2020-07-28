import _ from 'lodash'
import { progressiveClaimer, progressiveCommander } from './body/body'

function getOwnedRooms() {
  const roomCount = global.Cache.ownedRooms
  return (_.isUndefined(roomCount) ? (global.Cache.ownedRooms = Object.keys(Memory.myRooms).length) : roomCount) || 0
}

const claimerThreshold = BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]
function autoClaim(spawn: StructureSpawn, creepCountByRole: number[]) {
  if (spawn.room.energyCapacityAvailable < claimerThreshold) return false
  if (getOwnedRooms() >= Math.min(Game.gcl.level, Memory.roomLimit || 0)) return false
  if (spawn.room.memory._claim) {
    if (!creepCountByRole[Role.CLAIMER]) {
      spawn.trySpawnCreep(progressiveClaimer(spawn.room.energyCapacityAvailable), 'C', { role: Role.CLAIMER, room: spawn.room.name, deprivity: 0 }, false, 20)
      return true
    }
  } else if (!creepCountByRole[Role.SCOUT]) {
    spawn.trySpawnCreep([MOVE], 'S', { role: Role.SCOUT, room: spawn.room.name, deprivity: 0 })
    return true
  }
  return false
}

export default function domination(spawn: StructureSpawn, creepCountByRole: number[]) {
  const mem = spawn.room.memory
  if (!mem._attack) return autoClaim(spawn, creepCountByRole)
  const memory = { role: Role.COMMANDER, room: spawn.room.name, deprivity: 0 }
  const body = progressiveCommander(spawn.room.energyCapacityAvailable, mem._attackLevel || 3)
  const boostRequests = spawn.room.prepareBoostData(memory, [HEAL, TOUGH], ['heal', 'damage'], body)
  spawn.trySpawnCreep(body, 'S', memory, false, 10, boostRequests)
  return true
}
