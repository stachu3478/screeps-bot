import '../test/unit/constants'

const getActive = (
  hp: number,
  body: BodyPartConstant[],
  type: BodyPartConstant,
) => {
  const size = body.length
  return body.reduce(
    (t, partType, i) =>
      type === partType && hp - (size - i) * 100 > -100 ? t + 1 : t,
    0,
  )
}

function simulateCreepFight(
  creep1: BodyPartConstant[],
  creep2: BodyPartConstant[],
  startHp1: number,
) {
  const hpMax1 = creep1.length * 100
  const hpMax2 = creep2.length * 100
  let hp1 = startHp1
  let hp2 = hpMax2
  let moves = 0
  while (hp1 > 0 && hp2 > 0) {
    const dmg1 =
      getActive(hp1, creep1, ATTACK) * ATTACK_POWER +
      getActive(hp1, creep1, RANGED_ATTACK) * RANGED_ATTACK_POWER
    const dmg2 =
      getActive(hp2, creep2, ATTACK) * ATTACK_POWER +
      getActive(hp2, creep2, RANGED_ATTACK) * RANGED_ATTACK_POWER
    hp2 -= dmg1
    hp1 -= dmg2
    console.log(`Creep1 hits creep2 with ${dmg1} damage. ${hp1}/${hpMax1}`)
    console.log(`Creep2 hits creep1 with ${dmg2} damage. ${hp2}/${hpMax2}`)
    moves++
  }
  if (hp1 <= 0) console.log('Creep1 dies')
  else {
    console.log('Creep2 dies')
    let healParts = getActive(hp1, creep1, HEAL)
    if (healParts > 0)
      while (hp1 < hpMax1) {
        const healed = healParts * HEAL_POWER
        hp1 += healed
        healParts = getActive(hp1, creep1, HEAL)
        console.log(`Creep1 healed ${healed} hits. ${hp1}/${hpMax2}`)
        moves++
      }
  }
  console.log(`${moves} moves total.`)
}

const hp1 =
  [
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
  ].length * 100
simulateCreepFight(
  [
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
    HEAL,
    MOVE,
  ],
  [
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    RANGED_ATTACK,
    HEAL,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    MOVE,
    HEAL,
    HEAL,
    HEAL,
    HEAL,
    RANGED_ATTACK,
    MOVE,
  ],
  hp1,
)
