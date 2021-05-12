import BodyDefinition from './body/BodyDefinition'

const maxTowerOuterAttack =
  CONTROLLER_STRUCTURES.tower[8] * TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF)
const requiredToughHits = maxTowerOuterAttack * 2
const requiredHeal = maxTowerOuterAttack
export function needsTowerEkhauster(spawn: StructureSpawn, count: number) {
  if (count) return false
  if (!spawn.room.memory[RoomMemoryKeys.ekhaust]) return false
  if (spawn.room.energyAvailable < 12000) return false
  const bodyDef = new BodyDefinition(
    requiredToughHits,
    requiredHeal,
    // @ts-ignore private property error
    room.boosts,
    RANGED_ATTACK,
  )
  return bodyDef.body.length <= MAX_CREEP_SIZE
}

export function spawnTowerEkhauster(spawn: StructureSpawn) {
  const room = spawn.room
  const bodyDef = new BodyDefinition(
    requiredToughHits,
    requiredHeal,
    // @ts-ignore private property error
    room.boosts,
    RANGED_ATTACK,
  )

  const body = bodyDef.body
  const memory = {
    role: Role.BOOSTER,
    _targetRole: Role.TOWER_EKHAUSTER,
    room: spawn.room.name,
    deprivity: 50,
  }
  const creepName = 'E' + spawn.name
  if (bodyDef.toughResource)
    room.boosts.createRequest(
      creepName,
      bodyDef.toughResource,
      bodyDef.toughCount,
      true,
    )
  if (bodyDef.healResource)
    room.boosts.createRequest(
      creepName,
      bodyDef.healResource,
      bodyDef.healCount,
      true,
    )
  if (bodyDef.moveResource)
    room.boosts.createRequest(
      creepName,
      bodyDef.moveResource,
      bodyDef.moveCount,
      true,
    )
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
