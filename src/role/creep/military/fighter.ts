import fight from 'routine/military/fight'

export default function fighter(creep: Creep) {
  const enemy = creep.room.cache.enemy
  console.log(`keepDistance=${creep.room.cache.holdFire}`)
  switch (creep.memory.state) {
    case State.INIT:
      creep.notifyWhenAttacked(false)
      creep.memory.state = State.FIGHT
      break
    case State.FIGHT:
      fight(creep, enemy, creep.room.cache.holdFire)
      break
    default:
      creep.memory.state = State.INIT
  }
}
