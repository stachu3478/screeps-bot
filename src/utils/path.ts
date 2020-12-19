import { posToChar } from 'planner/pos'
import { findSourceKeepers } from './find'
import charPosIterator from './charPosIterator'

interface OffsetByDirection {
  [key: number]: number[]
}
export const offsetsByDirection: OffsetByDirection = {
  [TOP]: [0, -1],
  [TOP_RIGHT]: [1, -1],
  [RIGHT]: [1, 0],
  [BOTTOM_RIGHT]: [1, 1],
  [BOTTOM]: [0, 1],
  [BOTTOM_LEFT]: [-1, 1],
  [LEFT]: [-1, 0],
  [TOP_LEFT]: [-1, -1],
}

function saveCache(positions: RoomPosition[]) {
  if (!positions.length) return
  let poses = ''
  positions.forEach((p) => {
    poses += posToChar(p)
  })
  global.Cache.roomKeepers[positions[0].roomName] = poses
}

const blackMatrix = new PathFinder.CostMatrix()
for (let ox = 0; ox <= 49; ox++)
  for (let oy = 0; oy <= 49; oy++) blackMatrix.set(ox, oy, 255)
function roomCallback(roomName: string, costMatrix: CostMatrix) {
  if (Memory.pathRoomBlacklist && Memory.pathRoomBlacklist[roomName])
    return blackMatrix
  const room = Game.rooms[roomName]
  if (!room) {
    const cache = global.Cache.roomKeepers[roomName]
    if (cache)
      charPosIterator(cache, (x, y) => {
        for (let ox = -3; ox <= 3; ox++)
          for (let oy = -3; oy <= 3; oy++) costMatrix.set(x + ox, y + oy, 25)
      })
    const structs = global.Cache.roomStructures[roomName]
    if (structs) charPosIterator(structs, (x, y) => costMatrix.set(x, y, 255))
    return costMatrix
  }
  const sourceKeepers = findSourceKeepers(room)
  sourceKeepers.forEach((c) => {
    const { x, y } = c.pos
    for (let ox = -3; ox <= 3; ox++)
      for (let oy = -3; oy <= 3; oy++) costMatrix.set(x + ox, y + oy, 25)
  })
  saveCache(sourceKeepers.map((c) => c.pos))
  let structStr = ''
  room.find(FIND_STRUCTURES).forEach((s) => {
    structStr += posToChar(s.pos)
  })
  global.Cache.roomStructures[roomName] = structStr
  return costMatrix
}

export const isWalkable = (room: Room, x: number, y: number, me?: Creep) => {
  const structures = room.lookForAt(LOOK_STRUCTURES, x, y)
  if (
    room.getTerrain().get(x, y) === TERRAIN_MASK_WALL &&
    !structures.some((s) => s.isWalkable)
  )
    return false
  if (!structures.every((s) => s.isWalkable)) return false
  return room.lookForAt(LOOK_CREEPS, x, y)[0] === me
}

const zmod = (a: number, b: number) => a - Math.floor(a / b) * b
const move = {
  anywhere: (
    creep: Creep,
    preferDirection: DirectionConstant = TOP,
    me?: Creep,
  ) => {
    const room = creep.room
    const { x, y } = creep.pos
    let dirOffset = 0
    for (let i = 0; i < 8; i++) {
      const dir = (zmod(preferDirection + dirOffset - 1, 8) +
        1) as DirectionConstant
      if (dir < 1 || dir > 8) throw new Error('Invalid direction')
      const offset = offsetsByDirection[dir]
      const mx = x + offset[0]
      const my = y + offset[1]
      if (isWalkable(room, mx, my, me)) {
        creep.move(dir)
        return true
      }
      if (dirOffset > -1) dirOffset++
      dirOffset = -dirOffset
    }
    return false
  },
  cheap: (
    creep: Creep,
    target: RoomPosition | _HasRoomPosition,
    safe: boolean = false,
    range: number = 0,
  ): ScreepsReturnCode => {
    if (creep.fatigue) return ERR_TIRED
    const costCallback = safe ? roomCallback : undefined
    let result = creep.moveTo(target, {
      noPathFinding: true,
      reusePath: 100,
      costCallback,
      range,
    })
    if (result === ERR_NOT_FOUND)
      result = creep.moveTo(target, {
        ignoreCreeps: true,
        reusePath: 100,
        costCallback,
        range,
      })
    const mem = creep.memory
    if (!mem._move) return result
    const path = mem._move.path
    const dir = parseInt(path.charAt(4)) as DirectionConstant
    if (dir) {
      const creepOnRoad = creep.room.lookForAt(
        LOOK_CREEPS,
        creep.pos.x + offsetsByDirection[dir][0],
        creep.pos.y + offsetsByDirection[dir][1],
      )[0]
      if (creepOnRoad) {
        if (!creepOnRoad.memory) {
          if (!creepOnRoad.my)
            result = creep.moveTo(target, { costCallback, range })
          else move.anywhere(creepOnRoad, dir, creep)
        } else if (!move.check(creepOnRoad)) {
          const swap =
            creepOnRoad.memory.role === Role.STATIC_UPGRADER ||
            creepOnRoad.memory.role === Role.MINER ||
            Math.random() > 0.8
          const dirTo = creepOnRoad.pos.getDirectionTo(creep)
          move.anywhere(creepOnRoad, swap ? dirTo : dir, creep) ||
            creepOnRoad.move(dirTo)
        }
      }
    }
    mem._move.t = Game.time
    return result
  },
  check: (creep: Creep) => {
    const moveData = creep.memory._move
    if (!moveData) return false
    return (moveData.t || 0) + 1 >= Game.time
  },
}

export default move
