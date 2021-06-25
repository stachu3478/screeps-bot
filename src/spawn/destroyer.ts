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
  const entryDamage = room.pathScanner.getEntryDamage(target)
  if (_.isUndefined(entryDamage)) return false
  if (room.duet.keeperPresent) return false
  return createBodyDefinition(room, entryDamage!).body.length <= MAX_CREEP_SIZE
}

export function spawnDestroyer(spawn: StructureSpawn) {
  const room = spawn.room
  const target = room.memory[RoomMemoryKeys.ekhaust]!
  const entryDamage = room.pathScanner.getEntryDamage(target)!
  const bodyDef = createBodyDefinition(room, entryDamage)

  const body = bodyDef.body
  const memory: CreepMemory = {
    role: Role.BOOSTER,
    newRole: Role.DESTROYER,
    room: spawn.room.name,
    deprivity: 50,
  }
  const creepName = uniqName('Y' + spawn.name)
  const boostingRequester = new BoostingRequester(room.boosts, bodyDef)
  boostingRequester.requestFor(creepName, 'dismantle', true)
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
