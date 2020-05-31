import { getFactory, getLab, getXYExtractor } from "utils/selectFromPos";
import { IDLE, LAB_BOOSTING } from "constants/state";

Object.defineProperty(Room.prototype, 'factory', {
  get: function () {
    const self = this as Room
    return getFactory(self, (self.memory.structs || '').charCodeAt(4))
  }
})

Object.defineProperty(Room.prototype, 'lab1', {
  get: function () {
    const self = this as Room
    return getLab(self, (self.memory.internalLabs || '').charCodeAt(0))
  }
})

Object.defineProperty(Room.prototype, 'lab2', {
  get: function () {
    const self = this as Room
    return getLab(self, (self.memory.internalLabs || '').charCodeAt(1))
  }
})

Object.defineProperty(Room.prototype, 'externalLabs', {
  get: function () {
    const self = this as Room
    if (!self.memory.externalLabs) return []
    return self.memory.externalLabs
      .split('')
      .map(char => getLab(self, char.charCodeAt(0)))
      .filter(l => l) as StructureLab[]
  }
})

Object.defineProperty(Room.prototype, 'allLabs', {
  get: function () {
    const self = this as Room
    const allLabs = self.externalLabs
    const lab1 = self.lab1
    if (lab1) allLabs.push(lab1)
    const lab2 = self.lab2
    if (lab2) allLabs.push(lab2)
    return allLabs
  }
})

Object.defineProperty(Room.prototype, 'mineral', {
  get: function () {
    const self = this as Room
    return self.find(FIND_MINERALS)[0]
  }
})

Object.defineProperty(Room.prototype, 'extractor', {
  get: function () {
    const self = this as Room
    const mineral = self.mineral
    return mineral && getXYExtractor(self, mineral.pos.x, mineral.pos.y)
  }
})

Room.prototype.unreserveBoost = function (creepName: string, type?: ResourceConstant) {
  const reservations = this.memory.boost
  if (!reservations) return
  const index = reservations.creeps.findIndex((name, i) => name === creepName && (!type || reservations.resources[i] === type))
  if (index === -1) return
  reservations.creeps.splice(index, 1)
  reservations.resources.splice(index, 1)
  reservations.amounts.splice(index, 1)
}

Room.prototype.isBoosting = function () {
  const reservations = this.memory.boost
  if (reservations) return reservations.creeps.some(name => {
    if (Game.creeps[name]) return true
    this.unreserveBoost(name)
    return false
  })
  return false
}

Room.prototype.reserveBoost = function (name: string, type: ResourceConstant, amount: number) {
  if (this.memory.labState !== IDLE || amount <= 0) return false
  let reservations = this.memory.boost
  if (!reservations) reservations = this.memory.boost = {
    creeps: [],
    resources: [],
    amounts: []
  }
  reservations.creeps.push(name)
  reservations.resources.push(type)
  reservations.amounts.push(amount)
  this.memory.labState = LAB_BOOSTING
  return true
}

Room.prototype.getBoost = function (creep: Creep) {
  let reservations = this.memory.boost
  if (!reservations) return
  const index = reservations.creeps.findIndex(name => creep.name === name)
  if (index === -1) return
  return {
    type: reservations.resources[index],
    amount: reservations.amounts[index]
  }
}
