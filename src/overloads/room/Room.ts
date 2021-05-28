import './buildingManagement'

import defineGetter from 'utils/defineGetter'
import SourceHandler from 'handler/SourceHandler'
import ShieldPlanner from 'planner/shieldPlanner'
import DefencePolicy from 'room/DefencePolicy'
import RoomBuildingRouter from 'job/buildingRoute/RoomBuildingRouter'
import { posToChar } from 'planner/pos'
import whirl from 'utils/whirl'
import { isWalkable } from 'utils/path'
import RoomRepairRouter from 'job/repairRoute/RoomRepairRouter'
import RoomLocation from './RoomLocation'
import RoomPathScanner from 'planner/RoomPathScanner'
import enemies from 'config/enemies'
import EnemyRoomDetector from 'planner/military/EnemyRoomDetector'
import claim from 'config/claim'
import BoostManager from './BoostManager'
import RoomBuildings from './RoomBuildings'
import DuetHandler from 'handler/DuetHandler'
import RoomLinks from './RoomLinks'

function defineRoomGetter<T extends keyof Room>(
  property: T,
  handler: (self: Room) => Room[T],
) {
  defineGetter<Room, RoomConstructor, T>(Room, property, handler)
}

defineRoomGetter('cache', (self) => {
  const cache = global.Cache.rooms
  return cache[self.name] || (cache[self.name] = { scoutsWorking: 0 })
})

defineRoomGetter('factoryCache', (self) => {
  const cache = global.Cache.factories
  return cache[self.name] || (cache[self.name] = {})
})

defineRoomGetter('powerSpawnCache', (self) => {
  const cache = global.Cache.powerSpawns
  return cache[self.name] || (cache[self.name] = {})
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

defineRoomGetter('mineral', (self) => {
  return self.find(FIND_MINERALS)[0]
})

defineRoomGetter('spawn', (self) => {
  return self.find(FIND_MY_SPAWNS)[0]
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

defineRoomGetter('buildingRouter', (self) => {
  return (
    self.cache.buildingRouter ||
    (self.cache.buildingRouter = new RoomBuildingRouter(self))
  )
})

defineRoomGetter('repairRouter', (self) => {
  return (
    self.cache.repairRouter ||
    (self.cache.repairRouter = new RoomRepairRouter(self))
  )
})

defineRoomGetter('links', (self) => {
  return self.cache.links || (self.cache.links = new RoomLinks(self))
})

defineRoomGetter('leastAvailablePosition', (self) => {
  const saved = self.cache.leastAvailablePosition
  if (saved) return self.positionFromChar(saved)
  const positions = PathFinder.search(
    self.sources.colonyPosition,
    self.find(FIND_EXIT).map((p) => ({ pos: p, range: 500 })),
    { flee: true, maxRooms: 1, swampCost: 2 },
  ).path
  let lastPosition = positions.find((p) => !p.lookFor(LOOK_STRUCTURES).length)
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

defineRoomGetter('location', (self) => {
  return new RoomLocation(self.name)
})

defineRoomGetter('pathScanner', (self) => {
  return (
    self.cache.pathScanner ||
    (self.cache.pathScanner = new RoomPathScanner(self, {
      maxCost: Math.max(enemies.maxCost, claim.maxCost),
    }))
  )
})

defineRoomGetter('owner', (self) => {
  const controller = self.controller
  if (!controller) return
  const owner = controller.owner || controller.reservation
  if (!owner) return
  return owner.username
})

defineRoomGetter('enemyDetector', (self) => {
  return (
    self.cache.enemyDetector ||
    (self.cache.enemyDetector = new EnemyRoomDetector(self))
  )
})

defineRoomGetter('boosts', (self) => {
  return self.cache.boosts || (self.cache.boosts = new BoostManager(self))
})

defineRoomGetter('buildings', (self) => {
  const cache = self.cache
  return cache.buildings || (cache.buildings = new RoomBuildings(self))
})

defineRoomGetter('duet', (self) => {
  const cache = self.cache
  return cache.duet || (cache.duet = new DuetHandler(self))
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
    new RoomPosition(0, 0, this.name)
  )
}

Room.prototype.buildingAt = function <T extends StructureConstant>(
  charCode: number,
  type: T,
) {
  return this.buildingAtXY(charCode & 63, charCode >> 6, type)
}

Room.prototype.buildingAtXY = function <T extends StructureConstant>(
  x: number,
  y: number,
  type: T,
) {
  return this.lookForAt(LOOK_STRUCTURES, x, y).find(
    (s) => s.structureType === type,
  ) as ConcreteStructure<T>
}

Room.prototype.labsFromChars = function (chars: string) {
  return chars
    .split('')
    .map((char) => this.buildingAt(char.charCodeAt(0), STRUCTURE_LAB))
    .filter((l) => l) as StructureLab[]
}
