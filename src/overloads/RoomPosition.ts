import { ALL_DIRECTIONS } from 'constants/support'
import utf15 from 'screeps-utf15'
import defineGetter from 'utils/defineGetter'
import { isWalkable, offsetsByDirection } from 'utils/path'
import ProfilerPlus from 'utils/ProfilerPlus'
import RoomLocation from './room/RoomLocation'

function defineRoomPositionGetter<T extends keyof RoomPosition>(
  property: T,
  handler: (self: RoomPosition) => RoomPosition[T],
) {
  defineGetter<RoomPosition, RoomPositionConstructor, T>(
    RoomPosition,
    property,
    handler,
  )
}

RoomPosition.prototype.rangeXY = function (x: number, y: number) {
  return Math.max(Math.abs(this.x - x), Math.abs(this.y - y))
}

RoomPosition.prototype.range = function (pos: RoomPosition) {
  return this.rangeXY(pos.x, pos.y)
}

RoomPosition.prototype.rangeTo = function (obj: _HasRoomPosition) {
  return this.range(obj.pos)
}

RoomPosition.prototype.building = function <T extends StructureConstant>(
  type: StructureConstant,
) {
  return this.lookFor(LOOK_STRUCTURES).find((s) => s.structureType === type) as
    | ConcreteStructure<T>
    | undefined
}

RoomPosition.prototype.isBorder = function () {
  return this.x === 49 || this.y === 49 || this.x === 0 || this.y === 0
}

RoomPosition.prototype.disbordered = function () {
  let x = this.x
  let y = this.y
  if (x === 49) x = 48
  if (y === 49) y = 48
  if (x === 0) x = 1
  if (y === 0) y = 1
  return new RoomPosition(x, y, this.roomName)
}

RoomPosition.prototype.lookForAtInRange = function (type, range) {
  const room = Game.rooms[this.roomName]
  if (!room) return []
  const minY = Math.max(0, this.y - range)
  const minX = Math.max(0, this.x - range)
  const maxY = Math.min(49, this.y + range)
  const maxX = Math.min(49, this.x + range)
  return room.lookForAtArea(type, minY, minX, maxY, maxX, true)
}

RoomPosition.prototype.offset = function (direction) {
  const x = this.x + offsetsByDirection[direction][0]
  const y = this.y + offsetsByDirection[direction][1]
  try {
    return new RoomPosition(x, y, this.roomName)
  } catch (e) {
    return
  }
}

RoomPosition.prototype.isWalkable = function (me) {
  const room = Game.rooms[this.roomName]
  if (!room) {
    return this.lookFor(LOOK_TERRAIN).every((t) => t !== 'wall')
  }
  return isWalkable(room, this.x, this.y, me)
}

RoomPosition.prototype.eachOffset = function (callback) {
  ALL_DIRECTIONS.forEach((direction) => {
    const offsetPos = this.offset(direction)
    if (offsetPos) {
      callback(offsetPos, direction)
    }
  })
}

defineRoomPositionGetter('allOffsets', (self) => {
  const offsetPositions: RoomPosition[] = []
  ALL_DIRECTIONS.forEach((direction) => {
    const offsetPos = self.offset(direction)
    if (offsetPos) {
      offsetPositions.push(offsetPos)
    }
  })
  return offsetPositions
})

defineRoomPositionGetter('walkable', (self) => {
  const room = Game.rooms[self.roomName]
  if (!room) {
    return self.lookFor(LOOK_TERRAIN).every((t) => t !== 'wall')
  }
  return isWalkable(room, self.x, self.y)
})

export const reverseCord = (v: number) => {
  if (v === 0) return 49
  if (v === 49) return 0
  return v
}
defineRoomPositionGetter('mirror', (self) => {
  const x = reverseCord(self.x)
  const y = reverseCord(self.y)
  return new RoomPosition(x, y, self.roomName)
})

const roomPositionLookupCodec = new utf15.Codec<1>({
  depth: [8, 8, 6, 6],
  array: 1,
})
defineRoomPositionGetter('lookup', (self) => {
  const location = new RoomLocation(self.roomName)
  const codecArray = [location.x + 128, location.y + 128, self.x, self.y]
  return roomPositionLookupCodec.encode(codecArray) as Lookup<RoomPosition>
})

RoomPosition.from = (lookup) => {
  const [rx, ry, x, y] = roomPositionLookupCodec.decode(lookup)
  const roomName = RoomLocation.reverseIndex(rx - 128, ry - 128)
  try {
    return new RoomPosition(x, y, roomName)
  } catch (err) {
    console.log(err, x, y, roomName, lookup, rx, ry)
    return new RoomPosition(25, 25, roomName)
  }
}

ProfilerPlus.instance.overrideObject(RoomPosition, 'RoomPosition')
