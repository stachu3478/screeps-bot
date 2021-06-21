import './buildingManagement'

import _ from 'lodash'
import defineGetter from 'utils/defineGetter'
import SourceHandler from 'handler/SourceHandler'
import DefencePolicy from 'room/DefencePolicy'
import RoomBuildingRouter from 'job/buildingRoute/RoomBuildingRouter'
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
import RoomPositions from './RoomPositions'
import DepositPlanner from 'planner/DepositPlanner'
import ProfilerPlus from 'utils/ProfilerPlus'
import RemoteMiningMonitor from 'utils/RemoteMiningMonitor'
import RoomOutpostDefense from './RoomOutpostDefense'

function defineRoomGetter<T extends keyof Room>(
  property: T,
  handler: (self: Room) => Room[T],
) {
  defineGetter<Room, RoomConstructor, T>(Room, property, handler)
}

function memoizeByRoom<T>(fn: (r: Room) => T) {
  return _.memoize(fn, (r: Room) => r.name)
}

const roomCache = memoizeByRoom((r) => ({
  scoutsWorking: 0,
  sourceKeeperPositions: [],
  structurePositions: [],
}))
defineRoomGetter('cache', (self) => roomCache(self))

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

const roomSourceHandler = memoizeByRoom((r) => new SourceHandler(r))
defineRoomGetter('sources', (self) => roomSourceHandler(self))

defineRoomGetter('my', (self) => {
  return self.controller ? self.controller.my === true : false
})

const roomPositions = memoizeByRoom((r) => new RoomPositions(r))
defineRoomGetter('positions', (self) => roomPositions(self))

const roomDefencePolicy = memoizeByRoom((r) => new DefencePolicy(r))
defineRoomGetter('defencePolicy', (self) => roomDefencePolicy(self))

const roomBuildingRouter = memoizeByRoom((r) => new RoomBuildingRouter(r))
defineRoomGetter('buildingRouter', (self) => roomBuildingRouter(self))

const roomRepairRouter = memoizeByRoom((r) => new RoomRepairRouter(r))
defineRoomGetter('repairRouter', (self) => roomRepairRouter(self))

const roomLinks = memoizeByRoom((r) => new RoomLinks(r))
defineRoomGetter('links', (self) => roomLinks(self))

const roomLocation = memoizeByRoom((r) => new RoomLocation(r.name))
defineRoomGetter('location', (self) => roomLocation(self))

const roomPathScanner = memoizeByRoom(
  (r) =>
    new RoomPathScanner(r, {
      maxCost: Math.max(enemies.maxCost, claim.maxCost),
    }),
)
defineRoomGetter('pathScanner', (self) => roomPathScanner(self))

defineRoomGetter('owner', (self) => {
  const controller = self.controller
  if (!controller) return
  const owner = controller.owner || controller.reservation
  if (!owner) return
  return owner.username
})

const roomEnemyDetector = memoizeByRoom((r) => new EnemyRoomDetector(r))
defineRoomGetter('enemyDetector', (self) => roomEnemyDetector(self))

const roomBoostManager = memoizeByRoom((r) => new BoostManager(r))
defineRoomGetter('boosts', (self) => roomBoostManager(self))

const roomBuildings = memoizeByRoom((r) => new RoomBuildings(r))
defineRoomGetter('buildings', (self) => roomBuildings(self))

const roomDuetHandler = memoizeByRoom((r) => new DuetHandler(r))
defineRoomGetter('duet', (self) => roomDuetHandler(self))

const roomDepositPlanner = memoizeByRoom((r) => new DepositPlanner(r))
defineRoomGetter('depositPlanner', (self) => roomDepositPlanner(self))

const roomRemoteMiningMonitor = memoizeByRoom(
  (r) => new RemoteMiningMonitor(r.visual),
)
defineRoomGetter('remoteMiningMonitor', (self) => roomRemoteMiningMonitor(self))
const roomOutpostDefense = memoizeByRoom(
  (r) => new RoomOutpostDefense(r.memory),
)
defineRoomGetter('outpostDefense', (self) => roomOutpostDefense(self))

Room.prototype.store = function (resource: ResourceConstant) {
  const storage = this.storage
  const terminal = this.terminal
  const inStorage = storage ? storage.store[resource] : 0
  const inTerminal = terminal ? terminal.store[resource] : 0
  return inStorage + inTerminal
}

Room.prototype.totalStore = function (resource: ResourceConstant) {
  const factory = this.buildings.factory
  const inFactory = factory ? factory.store[resource] : 0
  const inCreeps = _.sum(this.find(FIND_MY_CREEPS), (c) => c.store[resource])
  return inFactory + inCreeps + this.store(resource)
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

Room.prototype.findHostileCreeps = function (filter) {
  const list = enemies.allies
  const lastFiler = filter || (() => true)
  return this.find(FIND_HOSTILE_CREEPS, {
    filter: (c) => !list[c.owner.username] && lastFiler(c),
  })
}

Room.prototype.findHostilePowerCreeps = function (filter) {
  const list = enemies.allies
  const lastFiler = filter || (() => true)
  return this.find(FIND_HOSTILE_POWER_CREEPS, {
    filter: (c) => !list[c.owner.username] && lastFiler(c),
  })
}

ProfilerPlus.instance.overrideObject(Room, 'Room')
