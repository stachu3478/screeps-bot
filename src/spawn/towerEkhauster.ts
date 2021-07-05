import _ from 'lodash'
import BodyDefinition from './body/BodyDefinition'
import BoostingRequester from './body/BoostingRequester'
import { uniqName } from './name'

function createBodyDefinition(room: Room, damageToResist: number) {
  const requiredToughHits = damageToResist * 2
  const requiredHeal = damageToResist
  return new BodyDefinition(
    requiredToughHits,
    requiredHeal,
    // @ts-ignore private property error
    room.boosts,
    RANGED_ATTACK,
  )
}

export function needsTowerEkhauster(spawn: StructureSpawn, count: number) {
  if (count) return false
  const room = spawn.room
  const target = room.memory[RoomMemoryKeys.ekhaust]
  if (!target) return false
  if (room.energyAvailable < 12000) return false
  const entryDamage = room.pathScanner.getMaxDamage(target)
  if (_.isUndefined(entryDamage)) return false
  if (room.duet.protectorPresent) return false
  return createBodyDefinition(room, entryDamage!).body.length <= MAX_CREEP_SIZE
}

export function spawnTowerEkhauster(spawn: StructureSpawn) {
  const room = spawn.room
  const target = room.memory[RoomMemoryKeys.ekhaust]!
  const resistDamage = room.pathScanner.getMaxDamage(target)!
  const bodyDef = createBodyDefinition(room, resistDamage)

  const body = bodyDef.body
  const memory: CreepMemoryTraits = {
    role: Role.BOOSTER,
    newRole: Role.TOWER_EKHAUSTER,
    deprivity: 50,
  }
  const creepName = uniqName('E' + spawn.name)
  const boostingRequester = new BoostingRequester(
    room.boosts,
    bodyDef,
    creepName,
    true,
  )
  boostingRequester.requestFor('rangedAttack')
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
