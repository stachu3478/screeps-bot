import _ from 'lodash'
import BodyDefinition from './body/BodyDefinition'
import BoostingRequester from './body/BoostingRequester'
import { uniqName } from './name'

function createBodyDefinition(room: Room, damageToResist: number) {
  const requiredToughHits = damageToResist * 2
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
  const entryDamage = room.pathScanner.getMaxDamage(target)
  if (_.isUndefined(entryDamage)) return false
  if (room.duet.keeperPresent) return false
  return createBodyDefinition(room, entryDamage!).body.length <= MAX_CREEP_SIZE
}

export function spawnDestroyer(spawn: StructureSpawn) {
  const room = spawn.room
  const target = room.memory[RoomMemoryKeys.ekhaust]!
  const entryDamage = room.pathScanner.getMaxDamage(target)!
  const bodyDef = createBodyDefinition(room, entryDamage)

  const body = bodyDef.body
  const memory: CreepMemoryTraits = {
    role: Role.BOOSTER,
    newRole: Role.DESTROYER,
    deprivity: 50,
  }
  const creepName = uniqName('Y' + spawn.name)
  const boostingRequester = new BoostingRequester(
    room.boosts,
    bodyDef,
    creepName,
  )
  boostingRequester.requestFor('dismantle')
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
