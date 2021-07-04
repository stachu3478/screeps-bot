import _ from 'lodash'
import RoomEnemies from 'room/military/RoomEnemies'
import { ranger } from 'spawn/body/body'
import remoteMining from '../../config/remoteMining'

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
    const hits = _.sum(invaders, (i) => i.corpus.effectiveHitsMax)
    this.memory.f = [room.name, rangedAttackPower, healPower, hits]
  }

  fulfillBody() {
    if (!this.memory.f) {
      return false
    }
    const [, rangedAttackPower, healPower, hits] = this.memory.f
    const effectiveDamageNeeded = Math.ceil(
      hits / remoteMining.sources.maxFightTime,
    )
    const damageNeeded = effectiveDamageNeeded + healPower
    const allyHealParts = Math.ceil((rangedAttackPower + 1) / HEAL_POWER)
    const allyRangedAttackParts = Math.ceil(damageNeeded / RANGED_ATTACK_POWER)
    if (allyRangedAttackParts + allyHealParts > MAX_CREEP_SIZE / 2) {
      this.cancel()
    }
    return ranger(allyRangedAttackParts, allyHealParts)
  }

  cancel() {
    delete this.memory.f
  }

  get targetRoom() {
    return this.memory.f ? this.memory.f[0] : ''
  }
}
