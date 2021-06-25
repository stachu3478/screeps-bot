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
    const rangedAttackPower = _.sum(invaders, (i) => i.corpus.rangedAttackPower)
    const healPower = _.sum(invaders, (i) => i.corpus.healPower)
    this.memory.f = [room.name, rangedAttackPower, healPower]
  }

  fulfillBody() {
    if (!this.memory.f) {
      return false
    }
    const [, rangedAttackPower, healPower] = this.memory.f
    const allyHealParts = Math.ceil((rangedAttackPower + 1) / HEAL_POWER)
    const allyRangedAttackParts = Math.ceil(
      (healPower + 1) / RANGED_ATTACK_POWER,
    )
    if (allyRangedAttackParts + allyHealParts > MAX_CREEP_SIZE / 2) {
      console.log(
        'That big creep is not supported',
        allyRangedAttackParts,
        allyHealParts,
      )
      this.cancel()
    }
    console.log(
      'Requesting defender with',
      allyRangedAttackParts,
      allyHealParts,
    )
    return ranger(allyRangedAttackParts, allyHealParts)
  }

  cancel() {
    delete this.memory.f
  }

  get targetRoom() {
    return this.memory.f ? this.memory.f[0] : ''
  }
}
