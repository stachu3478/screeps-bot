import BodyDefinition from './body/BodyDefinition'

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
  const boostInfo = room.boosts.getBestAvailable(
    part,
    actions[i],
    body.filter((type) => type === part).length,
  )
  if (boostInfo) boostRequests.push(boostInfo)
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
