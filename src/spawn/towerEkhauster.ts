import BodyDefinition from './body/BodyDefinition'
import BoostingRequester from './body/BoostingRequester'
import { uniqName } from './name'

function createBodyDefinition(room: Room, entranceDamage: number) {
  const requiredToughHits = entranceDamage * 2
  const requiredHeal = entranceDamage
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
  const targetInfo = room.pathScanner.rooms[target]
  if (!targetInfo || !targetInfo.entranceDamage) return false
  return (
    createBodyDefinition(room, targetInfo.entranceDamage).body.length <=
    MAX_CREEP_SIZE
  )
}

export function spawnTowerEkhauster(spawn: StructureSpawn) {
  const room = spawn.room
  const target = room.memory[RoomMemoryKeys.ekhaust]!
  const targetInfo = room.pathScanner.rooms[target]!
  const bodyDef = createBodyDefinition(room, targetInfo.entranceDamage!)

  const body = bodyDef.body
  const memory = {
    role: Role.BOOSTER,
    _targetRole: Role.TOWER_EKHAUSTER,
    room: spawn.room.name,
    deprivity: 50,
  }
  const creepName = uniqName('E' + spawn.name)
  const boostingRequester = new BoostingRequester(room.boosts, bodyDef)
  boostingRequester.requestFor(creepName, 'rangedAttack', true)
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
