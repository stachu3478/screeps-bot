import { getXYRoad } from "utils/selectFromPos";
import { MINER } from "constants/role";
import { infoStyle } from "room/style";
import { getDistanceOrderedHatches } from "utils/find";

const allDirections: DirectionConstant[] = [1, 2, 3, 4, 5, 6, 7, 8]
StructureSpawn.prototype.getDirections = function () {
  const room = this.room
  const sx = this.pos.x
  const sy = this.pos.y
  const directions: DirectionConstant[] = []
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++) {
      const road = getXYRoad(room, sx + x, sy + y)
      if (!road) continue
      const direction = this.pos.getDirectionTo(sx + x, sy + y)
      if (direction) directions.push(direction)
    }
  if (directions.length > 0) return directions
  return allDirections
}

StructureSpawn.prototype.trySpawnCreep = function (body: BodyPartConstant[], name: string, memory: CreepMemory, retry: boolean = false, cooldown: number = 100, boost: BoostInfo[] = []) {
  const result = this.spawnCreep(body, name, { memory, directions: this.getDirections(), dryRun: true })
  const mem = this.room.memory as StableRoomMemory
  if (result !== 0) {
    if (!retry) this.memory.trySpawn = {
      creep: body,
      name,
      memory,
      cooldown,
      boost
    }
  } else {
    this.spawnCreep(body, name, { memory, directions: this.getDirections(), energyStructures: getDistanceOrderedHatches(this.room) })
    mem.priorityFilled = 0
    mem.creeps[name] = 0
    if (memory.role === MINER) mem.colonySources[this.memory.spawnSourceId || ''] = mem.colonySources[this.memory.spawnSourceId || ''].slice(0, 2) + name
    boost.forEach(data => {
      this.room.createBoostRequest(name, data.resource, data.partCount)
    })
    delete this.memory.spawnSourceId
    delete this.memory.trySpawn
  }
  this.room.visual.text("Try to spawn " + name, 0, 3, infoStyle)
  return result
}
