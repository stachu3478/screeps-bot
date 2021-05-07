import './buildingManagement'
import './boostManagement'

import defineGetter from 'utils/defineGetter'
import SourceHandler from 'handler/SourceHandler'
import ShieldPlanner from 'planner/shieldPlanner'
import DefencePolicy from 'room/DefencePolicy'
import { getLink } from 'utils/selectFromPos'
import RoomBuildingRoute from 'job/buildingRoute/RoomBuildingRoute'
import RoomBuildingRouter from 'job/buildingRoute/RoomBuildingRouter'
import { posToChar } from 'planner/pos'
import whirl from 'utils/whirl'
import { isWalkable } from 'utils/path'

function defineRoomGetter<T>(property: string, handler: (self: Room) => T) {
  defineGetter<Room, RoomConstructor, T>(Room, property, handler)
}

defineRoomGetter('cache', (self) => {
  const cache = global.Cache.rooms
  return cache[self.name] || (cache[self.name] = {})
})

defineRoomGetter('factoryCache', (self) => {
  const cache = global.Cache.factories
  return cache[self.name] || (cache[self.name] = {})
})

defineRoomGetter('powerSpawnCache', (self) => {
  const cache = global.Cache.powerSpawns
  return cache[self.name] || (cache[self.name] = {})
})

defineRoomGetter('factory', (self) => {
  return self.buildingAt(
    (self.memory.structs || '').charCodeAt(4),
    STRUCTURE_FACTORY,
  )
})

defineRoomGetter('lab1', (self) => {
  return self.buildingAt(
    (self.memory.internalLabs || '').charCodeAt(0),
    STRUCTURE_LAB,
  )
})

defineRoomGetter('lab2', (self) => {
  return self.buildingAt(
    (self.memory.internalLabs || '').charCodeAt(1),
    STRUCTURE_LAB,
  )
})

defineRoomGetter('externalLabs', (self) => {
  return self.labsFromChars(self.memory.externalLabs || '')
})

defineRoomGetter('allLabs', (self) => {
  return self.labsFromChars(
    (self.memory.externalLabs || '') + (self.memory.internalLabs || ''),
  )
})

defineRoomGetter('mineral', (self) => {
  return self.find(FIND_MINERALS)[0]
})

defineRoomGetter('extractor', (self) => {
  const mineral = self.mineral
  return mineral && mineral.pos.building(STRUCTURE_EXTRACTOR)
})

defineRoomGetter('filled', (self) => {
  return (
    !!self.cache.priorityFilled &&
    self.energyAvailable === self.energyCapacityAvailable
  )
})

defineRoomGetter('linked', (self) => {
  const linkCharArray = (self.memory.links || '')
    .concat(self.memory.controllerLink || '')
    .split('')
  return (
    linkCharArray.length > 0 &&
    linkCharArray.every(
      (char) => !!self.buildingAt(char.charCodeAt(0), STRUCTURE_LINK),
    )
  )
})

defineRoomGetter('spawn', (self) => {
  return self.find(FIND_MY_SPAWNS)[0]
})

defineRoomGetter('powerSpawn', (self) => {
  const structs = self.memory.structs || ''
  return self.buildingAt(structs.charCodeAt(11), STRUCTURE_POWER_SPAWN)
})

defineRoomGetter('sources', (self) => {
  return self._sourceHandler || (self._sourceHandler = new SourceHandler(self))
})

defineRoomGetter('my', (self) => {
  return self.controller ? self.controller.my === true : false
})

defineRoomGetter('shieldPositions', (self) => {
  const cache = self.cache
  if (!cache.shieldPlanner) cache.shieldPlanner = new ShieldPlanner(self)
  return cache.shieldPlanner.roomPositions
})

defineRoomGetter('defencePolicy', (self) => {
  const cache = self.cache
  if (!cache.defencePolicy) cache.defencePolicy = new DefencePolicy(self)
  return cache.defencePolicy
})

const spawnOrExtension: Record<string, number> = {
  [STRUCTURE_SPAWN]: 1,
  [STRUCTURE_EXTENSION]: 1,
}
defineRoomGetter('spawnsAndExtensions', (self) => {
  return self
    .find(FIND_STRUCTURES)
    .filter((s) => spawnOrExtension[s.structureType]) as (
    | StructureSpawn
    | StructureExtension
  )[]
})

defineRoomGetter('spawnLink', (self) => {
  if (!self.memory.structs) return
  return getLink(self, self.memory.structs.charCodeAt(0))
})

defineRoomGetter('buildingRouter', (self) => {
  return (
    self.cache.buildingRouter ||
    (self.cache.buildingRouter = new RoomBuildingRouter(self))
  )
})

defineRoomGetter('leastAvailablePosition', (self) => {
  const saved = self.cache.leastAvailablePosition
  if (saved) return self.positionFromChar(saved)
  const positions = PathFinder.search(
    self.sources.colonyPosition,
    self.find(FIND_EXIT),
    { flee: true, maxRooms: 1, swampCost: 2 },
  ).path
  let lastPosition = positions.pop()
  if (!lastPosition) {
    const xy = whirl(
      25,
      25,
      (x, y) =>
        isWalkable(self, x, y) && !self.lookForAt(LOOK_STRUCTURES, x, y).length,
    )
    if (!xy) throw new Error('Failed to find least available position')
    lastPosition = new RoomPosition(xy[0], xy[1], self.name)
  }
  self.cache.leastAvailablePosition = posToChar(lastPosition)
  return lastPosition
})

Room.prototype.store = function (resource: ResourceConstant) {
  const storage = this.storage
  const terminal = this.terminal
  const inStorage = storage ? storage.store[resource] : 0
  const inTerminal = terminal ? terminal.store[resource] : 0
  return inStorage + inTerminal
}

Room.prototype.positionFromChar = function (char: string) {
  const charCode = char.charCodeAt(0)
  return (
    this.getPositionAt(charCode & 63, charCode >> 6) ||
    new RoomPosition(-1, -1, this.name)
  )
}

Room.prototype.buildingAt = function (
  charCode: number,
  type: StructureConstant,
) {
  return this.lookForAt(LOOK_STRUCTURES, charCode & 63, charCode >> 6).find(
    (s) => s.structureType === type,
  )
}

Room.prototype.labsFromChars = function (chars: string) {
  return chars
    .split('')
    .map((char) => this.buildingAt(char.charCodeAt(0), STRUCTURE_LAB))
    .filter((l) => l) as StructureLab[]
}
