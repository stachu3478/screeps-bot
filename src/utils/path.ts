import _ from 'lodash'
import { posToChar } from 'planner/pos'
import { MINER } from 'constants/role';
import { findSourceKeepers } from './find';

interface OffsetByDirection {
  [key: number]: number[]
}
const offsetsByDirection: OffsetByDirection = {
  [TOP]: [0, -1],
  [TOP_RIGHT]: [1, -1],
  [RIGHT]: [1, 0],
  [BOTTOM_RIGHT]: [1, 1],
  [BOTTOM]: [0, 1],
  [BOTTOM_LEFT]: [-1, 1],
  [LEFT]: [-1, 0],
  [TOP_LEFT]: [-1, -1]
};

function saveCache(positions: RoomPosition[]) {
  if (!positions.length) return
  if (!Memory.roomCacheKeepers) Memory.roomCacheKeepers = {}
  let poses = ''
  positions.forEach(p => {
    poses += posToChar(p)
  })
  Memory.roomCacheKeepers[positions[0].roomName] = poses
}

interface StructCache {
  [key: string]: string
}
const structCache: StructCache = {}
function roomCallback(roomName: string, costMatrix: CostMatrix) {
  const room = Game.rooms[roomName]
  if (!room) {
    const cache = Memory.roomCacheKeepers && Memory.roomCacheKeepers[roomName]
    if (cache) cache.split('').forEach(c => {
      const pos = c.charCodeAt(0)
      const x = pos & 63
      const y = pos >> 6
      for (let ox = -3; ox <= 3; ox++)
        for (let oy = -3; oy <= 3; oy++)
          costMatrix.set(x + ox, y + oy, 25)
    })
    const structs = structCache[roomName]
    if (structs) structs.split('').forEach(c => {
      const pos = c.charCodeAt(0)
      costMatrix.set(pos & 63, pos >> 6, 255)
    })
    return costMatrix
  }
  const sourceKeepers = findSourceKeepers(room)
  sourceKeepers.forEach(c => {
    const { x, y } = c.pos
    for (let ox = -3; ox <= 3; ox++)
      for (let oy = -3; oy <= 3; oy++)
        costMatrix.set(x + ox, y + oy, 25)
  })
  saveCache(sourceKeepers.map(c => c.pos))
  let structStr = ''
  room.find(FIND_STRUCTURES).forEach(s => {
    structStr += posToChar(s.pos)
  })
  structCache[roomName] = structStr
  return costMatrix
}

const isWalkable = (room: Room, x: number, y: number, me?: Creep) => {
  if (room.getTerrain().get(x, y) === TERRAIN_MASK_WALL) return false
  const nonWalkableStruct = _.find(room.lookForAt(LOOK_STRUCTURES, x, y), s => s.structureType !== STRUCTURE_ROAD && (s.structureType !== STRUCTURE_RAMPART || !(s as StructureRampart).my || !(s as StructureRampart).isPublic) && s.structureType !== STRUCTURE_CONTAINER)
  if (nonWalkableStruct) return false
  const site = _.find(room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y), s => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_CONTAINER)
  if (site) return false
  if (!me) return true
  const creep = _.find(room.lookForAt(LOOK_CREEPS, x, y), (c: Creep) => c !== me)
  if (creep) return false
  return true
}

const zmod = (a: number, b: number) => a - Math.floor(a / b) * b
const move = {
  anywhere: (creep: Creep, preferDirection: DirectionConstant = TOP, me?: Creep) => {
    const room = creep.room
    const { x, y } = creep.pos
    let dirOffset = 0
    for (let i = 0; i < 8; i++) {
      const dir = zmod(preferDirection + dirOffset - 1, 8) + 1 as DirectionConstant
      // console.log("Try to move at " + dir)
      if (dir < 1 || dir > 8) throw new Error("Invalid direction")
      const offset = offsetsByDirection[dir]
      const mx = x + offset[0]
      const my = y + offset[1]
      if (isWalkable(room, mx, my, me)) {
        // console.log("moved")
        creep.move(dir)
        return true
      }
      if (dirOffset > -1) dirOffset++
      dirOffset = -dirOffset
    }
    return false
  },
  cheap: (creep: Creep, target: RoomPosition | _HasRoomPosition, safe: boolean = false): ScreepsReturnCode => {
    if (creep.fatigue) return ERR_TIRED
    const costCallback = safe ? roomCallback : undefined
    let result = creep.moveTo(target, { noPathFinding: true, reusePath: 100, costCallback })
    if (result === ERR_NOT_FOUND) {
      result = creep.moveTo(target, { ignoreCreeps: true, reusePath: 100, costCallback })
    }
    const mem = creep.memory
    if (!mem._move) return result
    const path = mem._move.path
    const dir = parseInt(path.charAt(4)) as DirectionConstant
    const moved = parseInt(path.substr(0, 2)) === creep.pos.x && parseInt(path.substr(2, 2)) === creep.pos.y
    if (moved) mem._move.stuck = 0
    const stuck = mem._move.stuck || 0
    if (dir) {
      const creepOnRoad = creep.room.lookForAt(LOOK_CREEPS, creep.pos.x + offsetsByDirection[dir][0], creep.pos.y + offsetsByDirection[dir][1])[0]
      if (creepOnRoad) {
        if (!creepOnRoad.memory) {
          if (!creepOnRoad.my) return creep.moveTo(target, { costCallback })
          move.anywhere(creepOnRoad, dir, creep)
        } else if (creepOnRoad.memory._move && creepOnRoad.memory._move.path.length > stuck && stuck < 10) {
          // this creep is moving we wont do anything
        } else move.anywhere(creepOnRoad, (creepOnRoad.memory.role === MINER || stuck > 20) ? creepOnRoad.pos.getDirectionTo(creep) : dir, creep)
      }
    }
    mem._move.stuck = stuck + 1
    return result
  }
}

export default move
