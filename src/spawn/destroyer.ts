import _ from 'lodash'
import BodyDefinition from './body/BodyDefinition'
import BoostingRequester from './body/BoostingRequester'
import { uniqName } from './name'

function createBodyDefinition(room: Room, entranceDamage: number) {
  const requiredToughHits = entranceDamage * 2
  return new BodyDefinition(
    requiredToughHits,
    0,
    // @ts-ignore private property error
    room.boosts,
    WORK,
  )
}

export function needsDestroyer(spawn: StructureSpawn, count: number) {
  if (count) return false
  const room = spawn.room
  const target = room.memory[RoomMemoryKeys.ekhaust]
  if (!target) return false
  if (room.energyAvailable < 12000) return false
  const targetInfo = room.pathScanner.rooms[target]
  if (!targetInfo || _.isUndefined(targetInfo.entranceDamage)) return false
  const ekhaustedRoom = Game.rooms[target]
  if (!ekhaustedRoom) return false
  if (room.duet.formed) return false
  return (
    createBodyDefinition(room, targetInfo.entranceDamage!).body.length <=
    MAX_CREEP_SIZE
  )
}

export function spawnDestroyer(spawn: StructureSpawn) {
  const room = spawn.room
  const target = room.memory[RoomMemoryKeys.ekhaust]!
  const targetInfo = room.pathScanner.rooms[target]!
  const bodyDef = createBodyDefinition(room, targetInfo.entranceDamage!)

  const body = bodyDef.body
  const memory = {
    role: Role.BOOSTER,
    _targetRole: Role.DESTROYER,
    room: spawn.room.name,
    deprivity: 50,
  }
  const creepName = uniqName('Y' + spawn.name)
  const boostingRequester = new BoostingRequester(room.boosts, bodyDef)
  boostingRequester.requestFor(creepName, 'dismantle', true)
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
