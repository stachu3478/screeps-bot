import _ from 'lodash'
import RoomEnemies from 'room/military/RoomEnemies'
import { ranger } from 'spawn/body/body'

export default class RoomOutpostDefense {
  private memory: RoomMemory

  constructor(memory: RoomMemory) {
    this.memory = memory
  }

  request(room: Room) {
    if (this.memory.f) {
      return
    }
    const invaders = new RoomEnemies(room).find()
    const rangedAttackParts = _.sum(invaders, (i) =>
      i.corpus.count(RANGED_ATTACK),
    )
    const healParts = _.sum(invaders, (i) => i.corpus.count(HEAL))
    this.memory.f = [room.name, rangedAttackParts, healParts]
  }

  fulfillBody() {
    if (!this.memory.f) {
      return false
    }
    const [, rangedAttackParts, healParts] = this.memory.f
    const allyHealParts = Math.ceil(
      (rangedAttackParts * RANGED_ATTACK_POWER + 1) / HEAL_POWER,
    )
    const allyRangedAttackParts = Math.ceil(
      (healParts * HEAL_POWER + 1) / RANGED_ATTACK_POWER,
    )
    if (allyRangedAttackParts + allyHealParts > MAX_CREEP_SIZE / 2) {
      console.log(
        'That big creep is not supported',
        allyRangedAttackParts,
        allyHealParts,
      )
    }
    console.log(
      'Requesting defender with',
      allyRangedAttackParts,
      allyHealParts,
    )
    return ranger(allyRangedAttackParts, allyHealParts)
  }

  get targetRoom() {
    return this.memory.f ? this.memory.f[0] : ''
  }
}
