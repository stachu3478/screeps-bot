import Corpus from '../Corpus'

export default class PowerCreepCorpus extends Corpus<PowerCreep> {
  count(type: BodyPartConstant) {
    if (!this.object) {
      return 0
    }
    if (type === MOVE) {
      return Infinity
    }
    if (type === CARRY) {
      return Math.floor(this.permitted.store.getCapacity() / CARRY_CAPACITY)
    }
    return 0
  }

  getActive(type: BodyPartConstant) {
    return this.count(type)
  }

  hasActive(type: BodyPartConstant) {
    return this.getActive(type) > 0
  }
}
