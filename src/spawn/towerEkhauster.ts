export function needsTowerEkhauster(spawn: StructureSpawn, count: number) {
  return (
    !count &&
    spawn.room.memory[RoomMemoryKeys.ekhaust] &&
    spawn.room.energyAvailable >= 12000
  )
}

export function spawnTowerEkhauster(spawn: StructureSpawn) {
  const room = spawn.room
  const maxTowerOuterAttack =
    CONTROLLER_STRUCTURES.tower[8] * TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF)
  const requiredToughHits = maxTowerOuterAttack * 2
  const requiredHeal = maxTowerOuterAttack

  const toughBoosts = BOOSTS.tough as { [key: string]: { damage: number } }
  const toughKeys: ResourceConstant[] = ['XGHO2', 'GHO2', 'GO']
  let toughPartCount = 0
  const toughBoost = toughKeys.find((b) => {
    const required = Math.ceil(
      (toughBoosts[b].damage * requiredToughHits) / 100,
    )
    const available = room.boosts.getAvailable(b, required)
    const canBeUsed = available === required
    if (available === required) toughPartCount = required
    return canBeUsed
  })
  const damage = toughBoost ? toughBoosts[toughBoost].damage : 1

  const healBoosts = BOOSTS.heal as { [key: string]: { heal: number } }
  const healKeys: ResourceConstant[] = ['XLHO2', 'LHO2', 'LO']
  let healPartCount = Math.ceil((damage * requiredHeal) / HEAL_POWER)
  const healBoost = healKeys.find((b) => {
    const required = Math.ceil(
      (damage * requiredHeal) / (HEAL_POWER * healBoosts[b].heal),
    )
    const available = room.boosts.getAvailable(b, required)
    const canBeUsed = available === required
    if (canBeUsed) healPartCount = required
    return canBeUsed
  })

  const moveBoosts = BOOSTS.move as { [key: string]: { fatigue: number } }
  const moveKeys: ResourceConstant[] = ['XZHO2', 'ZHO2', 'ZO']
  let movePartCount = toughPartCount + healPartCount
  const moveBoost = moveKeys.find((b) => {
    const required = Math.ceil(movePartCount / moveBoosts[b].fatigue)
    const available = room.boosts.getAvailable(b, required)
    const canBeUsed = available === required
    if (canBeUsed) movePartCount = required
    return canBeUsed
  })

  if (toughPartCount + healPartCount + movePartCount > MAX_CREEP_SIZE)
    throw new Error('Too big creep')

  const body: BodyPartConstant[] = new Array(toughPartCount)
    .fill(TOUGH)
    .concat(new Array(movePartCount).fill(MOVE))
    .concat(new Array(healPartCount).fill(HEAL))
  const memory = {
    role: Role.BOOSTER,
    _targetRole: Role.TOWER_EKHAUSTER,
    room: spawn.room.name,
    deprivity: 50,
  }
  const creepName = 'E' + spawn.name
  if (toughBoost)
    room.boosts.createRequest(creepName, toughBoost, toughPartCount, true)
  if (healBoost)
    room.boosts.createRequest(creepName, healBoost, healPartCount, true)
  if (moveBoost)
    room.boosts.createRequest(creepName, moveBoost, movePartCount, true)
  spawn.trySpawnCreep(body, creepName, memory, false, 10)
}
