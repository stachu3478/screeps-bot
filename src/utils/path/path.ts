import Feromon from '../feromon'
import { pickBestDirectionFrom } from 'routine/shared'
import _ from 'lodash'
import { findTargetCreeps } from 'routine/military/shared'
import roomCallback from './roomCallback'

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

export function createUnwalkableMatrix() {
  const matrix = new PathFinder.CostMatrix()
  for (let ox = 0; ox <= 49; ox++)
    for (let oy = 0; oy <= 49; oy++) matrix.set(ox, oy, 255)
  return matrix
}

export const isWalkable = (room: Room, x: number, y: number, me?: Creep) => {
  if (x < 0 || y < 0 || x > 49 || y > 49) return false
  const structures = room.lookForAt(LOOK_STRUCTURES, x, y)
  if (
    room.getTerrain().get(x, y) === TERRAIN_MASK_WALL &&
    !structures.some((s) => s.isWalkable)
  )
    return false
  if (!structures.every((s) => s.isWalkable)) return false
  const creep = room.lookForAt(LOOK_CREEPS, x, y)[0]
  const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y)
  if (!constructionSites.every((s) => s.isWalkable)) return false
  return !creep || creep === me
}

const isSafePos = (
  pos: RoomPosition,
  hostiles = Game.rooms[pos.roomName]?.findHostileCreeps(
    (creep) => creep.corpus.armed,
  ) || [],
) => {
  return hostiles.every((hostile) => pos.isSafeFrom(hostile))
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
    let bestDir = move.findNearestWalkableDirection(
      room,
      creep.pos,
      preferDirection,
      me,
    )
    if (bestDir === 0) return false
    creep.move(bestDir)
    Feromon.increment(room.name, x, y)
    return true
  },
  findNearestWalkableDirection: (
    room: Room,
    pos: RoomPosition,
    direction: DirectionConstant,
    me?: Creep,
  ) => {
    let dirOffset = 0
    let bestDir: DirectionConstant | 0 = 0
    let leastFeromon = Infinity
    for (let i = 0; i < 8; i++) {
      const dir = (zmod(direction + dirOffset - 1, 8) + 1) as DirectionConstant
      const offset = offsetsByDirection[dir]
      const mx = pos.x + offset[0]
      const my = pos.y + offset[1]
      const walkable = isWalkable(room, mx, my, me)
      if (walkable) {
        const feromon = Feromon.collect(room.name, mx, my)
        if (feromon < leastFeromon || bestDir === 0) {
          leastFeromon = feromon
          bestDir = dir
        }
      }
      if (dirOffset > -1) dirOffset++
      dirOffset = -dirOffset
    }
    return bestDir
  },
  handleCreepOnRoad: (
    creepOnRoad: Creep,
    creep: Creep,
    target: RoomPosition | _HasRoomPosition,
    options: MoveToOpts,
    dir: DirectionConstant,
    result: ScreepsReturnCode,
  ) => {
    if (!creepOnRoad.memory) {
      if (!creepOnRoad.my) {
        options.noPathFinding = false
        options.ignoreCreeps = false
        options.reusePath = 0
        if (creep.corpus.armed) creep.attack(creepOnRoad)
        return creep.moveTo(target, options)
      } else move.anywhere(creepOnRoad, dir, creep)
    } else if (!move.check(creepOnRoad)) {
      if (!creepOnRoad.corpus.hasActive(MOVE)) {
        creep.pull(creepOnRoad)
        creepOnRoad.move(creep)
      } else {
        const swap =
          creepOnRoad.memory.role === Role.STATIC_UPGRADER ||
          creepOnRoad.memory.role === Role.MINER ||
          Math.random() > 0.8
        const dirTo = creepOnRoad.pos.getDirectionTo(creep)
        move.anywhere(creepOnRoad, swap ? dirTo : dir, creep) ||
          creepOnRoad.move(swap ? dir : dirTo)
      }
    }
    return result
  },
  getPathDirection: (memory: CreepMemory['_move']) => {
    if (!memory) return
    const path = memory.path
    return parseInt(path.charAt(4)) as DirectionConstant
  },
  keepAwayFromHostiles: (creep: Creep) => {
    const hostiles = findTargetCreeps(creep, (creep) => creep.corpus.armed)
    if (isSafePos(creep.pos, hostiles)) {
      return true
    }
    const direction = pickBestDirectionFrom(
      creep,
      hostiles,
      (distance) => distance,
    )
    move.anywhere(creep, direction)
    return false
  },
  handleStaticCreep: (
    creep: Creep,
    target: RoomPosition | _HasRoomPosition,
  ) => {
    const roomMemory = creep.motherRoom.memory
    roomMemory._moveNeeds = Math.max(
      roomMemory._moveNeeds || 0,
      creep.corpus.count(WORK) + creep.corpus.count(ATTACK),
    )
    if (!creep.cache.moverPath) {
      console.log('refreshing path')
      creep.cache.moverPath = creep.pos.findPathTo(target)
    }
    return 0
  },
  cheap: (
    creep: Creep,
    target: RoomPosition | _HasRoomPosition,
    safe: boolean = false,
    range: number = 0,
    maxRooms = 16,
  ): ScreepsReturnCode => {
    if (creep.fatigue) return ERR_TIRED
    if (safe && !move.keepAwayFromHostiles(creep)) return 0
    const options = {
      ignoreCreeps: false,
      noPathFinding: true,
      reusePath: 100,
      costCallback: safe ? roomCallback : undefined,
      range,
      maxRooms,
    }
    let result: ScreepsReturnCode = creep.moveTo(target, options)
    if (result === ERR_NOT_FOUND) {
      options.noPathFinding = false
      options.ignoreCreeps = true
      result = creep.moveTo(target, options)
    }
    if (result === ERR_NO_PATH)
      move.anywhere(creep, creep.pos.getDirectionTo(target))
    const mem = creep.memory
    const moveMemory = mem._move
    if (!moveMemory) return result
    const dir = move.getPathDirection(moveMemory)
    if (dir) {
      const offset = creep.pos.offset(dir)
      if (offset) {
        const creepOnRoad = offset.lookFor(LOOK_CREEPS)[0]
        if (creepOnRoad) {
          result = move.handleCreepOnRoad(
            creepOnRoad,
            creep,
            target,
            options,
            dir,
            result,
          )
        }
        if (!isSafePos(offset)) {
          creep.cancelOrder('move')
          delete creep.memory._move
        }
      }
    }
    moveMemory.t = Game.time
    return result
  },
  check: (creep: Creep) => {
    const moveData = creep.memory._move
    if (!moveData) return false
    return (moveData.t || 0) + 1 >= Game.time
  },
}

export default move
