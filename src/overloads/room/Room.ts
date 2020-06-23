import './buildingManagement'
import './boostManagement'
import { getFactory, getLab, getXYExtractor, getLink } from "utils/selectFromPos";

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

Object.defineProperty(Room.prototype, 'linked', {
  get: function () {
    const self = this as Room
    const links = self.memory.links
    const controllerLink = self.memory.controllerLink
    if (!links || !controllerLink) return false
    return !!(
      getLink(this, links.charCodeAt(links.length - 1))
      && getLink(this, controllerLink.charCodeAt(0))
    )
  }
})

Room.prototype.store = function (resource: ResourceConstant) {
  const storage = this.storage
  const terminal = this.terminal
  const inStorage = storage ? storage.store[resource] : 0
  const inTerminal = terminal ? terminal.store[resource] : 0
  return inStorage + inTerminal
}
