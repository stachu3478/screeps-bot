import _ from 'lodash'

const directions: DirectionConstant[] = [
  TOP,
  TOP_RIGHT,
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
  LEFT,
  TOP_LEFT,
]

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

function roomCallback(roomName: string, costMatrix: CostMatrix) {
  const room = Game.rooms[roomName]
  if (!room) return costMatrix
  const sourceKeepers = room.find(FIND_HOSTILE_CREEPS, {
    filter: c => c.owner.username === "Source Keeper"
  })
  sourceKeepers.forEach(c => {
    const { x, y } = c.pos
    for (let ox = -3; ox <= 3; ox++)
      for (let oy = -3; oy <= 3; oy++)
        costMatrix.set(x + ox, y + oy, 255)
  })
  return costMatrix
}

export function cheapMove(creep: Creep, target: RoomPosition | _HasRoomPosition, safe: boolean = false): ScreepsReturnCode {
  const costCallback = safe ? roomCallback : undefined
  let result = creep.moveTo(target, { noPathFinding: true, reusePath: 100, costCallback })
  if (result === ERR_NOT_FOUND) {
    result = creep.moveTo(target, { ignoreCreeps: true, reusePath: 100, costCallback })
  }
  const mem = creep.memory
  if (!mem._move) return result
  const dir = parseInt(mem._move.path.charAt(4))
  if (dir) {
    const creepOnRoad = creep.room.lookForAt(LOOK_CREEPS, creep.pos.x + offsetsByDirection[dir][0], creep.pos.y + offsetsByDirection[dir][1])[0]
    if (creepOnRoad) {
      if (!creepOnRoad.memory) {
        if (!creepOnRoad.my) return creep.moveTo(target, { costCallback })
        creepOnRoad.move(directions[_.random(1, 8)])
        mem._move.stuck = 0
      } else if (creepOnRoad.memory._move && creepOnRoad.memory._move.path.length > (mem._move.stuck || 0)) {
        // this creep is movind we wont do anything
        mem._move.stuck = (mem._move.stuck || 5) + 1
      } else creepOnRoad.move(directions[_.random(1, 8)])
    }
  }
  return result
}

export function sitifyPath(from: RoomPosition, to: RoomPosition | _HasRoomPosition) {
  const room = Game.rooms[from.roomName]
  const path = from.findPathTo(to, {
    ignoreCreeps: true,
    plainCost: 2,
    swampCost: 2,
    range: 1
  })
  path.forEach(obj => {
    const structures = room.lookForAt(LOOK_STRUCTURES, obj.x, obj.y)
    if (structures.length) return
    const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, obj.x, obj.y)
    if (sites.length) return
    room.createConstructionSite(obj.x, obj.y, STRUCTURE_ROAD)
  })
}
