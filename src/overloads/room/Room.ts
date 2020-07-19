import './buildingManagement'
import './boostManagement'
import { getFactory, getLab, getXYExtractor, getLink, getPowerSpawn } from "utils/selectFromPos";
import defineGetter from 'utils/defineGetter';

function defineRoomGetter<T>(property: string, handler: (self: Room) => T) {
  defineGetter<Room, RoomConstructor, T>(Room, property, handler)
}

defineRoomGetter('cache', self => {
  const cache = global.Cache.rooms
  return cache[self.name] || (cache[self.name] = {})
})

defineRoomGetter('factoryCache', self => {
  const cache = global.Cache.factories
  return cache[self.name] || (cache[self.name] = {})
})

defineRoomGetter('powerSpawnCache', self => {
  const cache = global.Cache.powerSpawns
  return cache[self.name] || (cache[self.name] = {})
})

defineRoomGetter('factory', self => {
  return getFactory(self, (self.memory.structs || '').charCodeAt(4))
})

defineRoomGetter('lab1', self => {
  return getLab(self, (self.memory.internalLabs || '').charCodeAt(0))
})

defineRoomGetter('lab2', self => {
  return getLab(self, (self.memory.internalLabs || '').charCodeAt(1))
})

defineRoomGetter('externalLabs', self => {
  if (!self.memory.externalLabs) return []
  return self.memory.externalLabs
    .split('')
    .map(char => getLab(self, char.charCodeAt(0)))
    .filter(l => l) as StructureLab[]
})

defineRoomGetter('allLabs', self => {
  const allLabs = self.externalLabs
  const lab1 = self.lab1
  if (lab1) allLabs.push(lab1)
  const lab2 = self.lab2
  if (lab2) allLabs.push(lab2)
  return allLabs
})

defineRoomGetter('mineral', self => {
  return self.find(FIND_MINERALS)[0]
})

defineRoomGetter('extractor', self => {
  const mineral = self.mineral
  return mineral && getXYExtractor(self, mineral.pos.x, mineral.pos.y)
})

defineRoomGetter('filled', (self) => {
  return self.cache.priorityFilled && self.energyAvailable === self.energyCapacityAvailable
})

defineRoomGetter('linked', self => {
  const links = self.memory.links
  const controllerLink = self.memory.controllerLink
  if (!links || !controllerLink) return false
  return !!(
    getLink(self, links.charCodeAt(links.length - 1))
    && getLink(self, controllerLink.charCodeAt(0))
  )
})

defineRoomGetter('spawn', self => {
  return self.find(FIND_MY_SPAWNS)[0]
})

defineRoomGetter('powerSpawn', self => {
  const structs = self.memory.structs
  return structs && getPowerSpawn(self, structs.charCodeAt(11))
})

Room.prototype.store = function (resource: ResourceConstant) {
  const storage = this.storage
  const terminal = this.terminal
  const inStorage = storage ? storage.store[resource] : 0
  const inTerminal = terminal ? terminal.store[resource] : 0
  return inStorage + inTerminal
}
