import { getXYRoad } from 'utils/selectFromPos';
import { infoStyle } from 'room/style';
import sanitizeBody from 'utils/sanitizeBody';
import { uniqName } from 'spawn/name';

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

StructureSpawn.prototype.trySpawnCreep = function (body: BodyPartConstant[], letter: string, memory: CreepMemory, retry: boolean = false, cooldown: number = 100, boost: BoostInfo[] = []) {
  const name = uniqName(letter)
  const result = this.spawnCreep(body, name, { memory, dryRun: true })
  const mem = this.room.memory
  if (result !== 0) {
    if (!retry) this.memory.trySpawn = {
      creep: body,
      name,
      memory,
      cooldown,
      boost
    }
  } else {
    const motherMemory = Memory.rooms[memory.room]
    if (!motherMemory.creeps) motherMemory.creeps = {}
    this.spawnCreep(sanitizeBody(body), name, { memory, directions: this.getDirections() /*energyStructures: getDistanceOrderedHatches(this.room, creepCost(body))*/ })
    mem.priorityFilled = 0
    motherMemory.creeps[name] = 0
    if (memory.role === Role.MINER && mem.colonySources) mem.colonySources[this.memory.spawnSourceId || ''] = mem.colonySources[this.memory.spawnSourceId || ''].slice(0, 2) + name
    boost.forEach(data => {
      this.room.createBoostRequest(name, data.resource, data.partCount)
    })
    delete this.memory.spawnSourceId
    delete this.memory.trySpawn
  }
  this.room.visual.text('Try to spawn ' + name, 0, 3, infoStyle)
  return result
}
