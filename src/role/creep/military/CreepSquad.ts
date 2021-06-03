import _ from 'lodash'
import Memoized from 'utils/Memoized'

export default class CreepSquad {
  private memoizedCreeps: Memoized<Creep>[]

  constructor(creeps: Creep[]) {
    this.memoizedCreeps = creeps.map((c) => {
      c.notifyWhenAttacked(false)
      return new Memoized(c)
    })
  }

  autoHeal() {
    console.log('heal')
    this.validCreeps.forEach((c) => {
      if (c.corpus.hasActive(HEAL)) {
        c.autoHeal()
      }
    })
  }

  autoAttack() {
    const creeps = this.validCreeps
    creeps.forEach((c) => {
      const corpus = c.corpus
      if (corpus.hasActive(ATTACK)) {
        const hostileCreep = c.pos
          .lookForAtInRange(LOOK_CREEPS, 1)
          .find((h) => !h.creep.my)
        if (hostileCreep) {
          c.attack(hostileCreep.creep)
          return
        }
        const hostilePowerCreep = c.pos
          .lookForAtInRange(LOOK_POWER_CREEPS, 1)
          .find((h) => !h.powerCreep.my)
        if (hostilePowerCreep) {
          c.attack(hostilePowerCreep.powerCreep)
          return
        }
      }
      if (corpus.hasActive(WORK) || corpus.hasActive(ATTACK)) {
        const nearStructures = c.pos
          .lookForAtInRange(LOOK_STRUCTURES, 1)
          .filter((s) => s.structure.hits)
        const nearHostileStructure = nearStructures.find(
          (s) =>
            Object.prototype.hasOwnProperty.call(s.structure, 'owner') &&
            _.property('my')(s.structure),
        )
        if (nearHostileStructure) {
          c.dismantleOrAttack(nearHostileStructure.structure)
          return
        }
        const nearStructure = nearStructures[0]
        if (nearStructure) {
          c.dismantleOrAttack(nearStructure.structure)
          return
        }
      }
    })
  }

  get safetyHealed() {
    const creeps = this.validCreeps
    return (
      !creeps.every((c) => c.hits !== c.hitsMax) &&
      creeps.every((c) => c.corpus.hasActive(TOUGH))
    )
  }

  get fullHealed() {
    return this.validCreeps.every((c) => c.hits === c.hitsMax)
  }

  get atBorder() {
    return this.validCreeps.some((c) => c.pos.rangeXY(25, 25) > 21)
  }

  protected get fatigued() {
    return this.validCreeps.some((c) => c.fatigue)
  }

  get validCreeps() {
    return this.creeps.map((m) => m.object).filter((c) => c) as Creep[]
  }

  get whole() {
    return this.creeps.every((c) => c.object)
  }

  get creeps() {
    return this.memoizedCreeps
  }
}
