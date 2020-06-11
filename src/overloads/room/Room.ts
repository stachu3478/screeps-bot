import './buildingManagement'
import './boostManagement'
import { getFactory, getLab, getXYExtractor } from "utils/selectFromPos";

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

Object.defineProperty(Room.prototype, 'filled', {
  get: function () {
    const self = this as Room
    return self.memory.priorityFilled && self.energyAvailable === self.energyCapacityAvailable
  }
})
