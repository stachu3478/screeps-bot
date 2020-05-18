import { SUCCESS, NOTHING_TODO, DONE } from '../constants/response'
import { getXYSpawn, getXYTower, getXYRampart, getXYWall } from 'utils/selectFromPos';

export default function placeShield(room: Room) {
  const controller = room.controller
  if (!controller) return NOTHING_TODO
  const mem = room.memory
  if (mem._shielded && mem._shielded > Game.time) return NOTHING_TODO
  if (!mem.structs) return NOTHING_TODO
  const structs = mem.structs

  let minDecay = Infinity
  const times = structs.length
  for (let i = 0; i < times; i++) {
    const xy = structs.charCodeAt(i)
    const x = xy & 63
    const y = xy >> 6
    let structure: Structure | undefined
    if (i === 1) structure = getXYSpawn(room, x, y)
    else if (i > 4 && i < 11) structure = getXYTower(room, x, y)
    else continue
    if (!structure) continue
    const rampart = getXYRampart(room, x, y)
    if (rampart) {
      minDecay = Math.min(minDecay, RAMPART_DECAY_TIME * Math.floor(rampart.hits / RAMPART_DECAY_AMOUNT) + rampart.ticksToDecay)
      continue
    }
    const result = room.createConstructionSite(x, y, STRUCTURE_RAMPART)
    console.log(result)
    if (result === 0) return SUCCESS
  }

  const controllerPos = controller.pos
  for (let x = -1; x < 2; x++)
    for (let y = -1; y < 2; y++) {
      const wall = getXYWall(room, controllerPos.x + x, controllerPos.y + y)
      if (wall) continue
      const result = room.createConstructionSite(controllerPos.x + x, controllerPos.y + y, STRUCTURE_WALL)
      console.log(result)
      if (result === 0) return SUCCESS
    }
  if (minDecay === Infinity) minDecay = 1
  mem._shielded = Game.time + minDecay
  console.log('Decay ' + room.name + ': ' + minDecay)
  return NOTHING_TODO
}
