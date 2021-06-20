import fight from 'routine/military/fight'

export interface Fighter extends Creep {
  memory: FighterMemory
}

interface FighterMemory extends CreepMemory {}

export default function fighter(
  creep: Fighter,
  enemy?: AnyCreep,
  keepDistance?: boolean,
) {
  console.log(`keepDistance=${keepDistance}`)
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.FIGHT
      break
    case State.FIGHT:
      fight(creep, enemy, keepDistance)
      break
    default:
      creep.memory.state = State.INIT
  }
}
