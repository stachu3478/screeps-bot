import { SUCCESS, NOTHING_TODO } from '../../constants/response'
import { getXYSpawn, getXYTower, getXYRampart, getXYWall } from 'utils/selectFromPos';
import { roomPos } from '../pos';

export default function placeShield(controller: StructureController) {
  const room = controller.room
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
    minDecay = 0
    const result = room.createConstructionSite(x, y, STRUCTURE_RAMPART)
    if (result === 0) return SUCCESS
  }

  const controllerPos = controller.pos
  const colonySourcePositions = Object.values(mem.colonySources || {}).map(p => roomPos(p, room.name))
  for (let x = -1; x < 2; x++)
    for (let y = -1; y < 2; y++) {
      const xPos = controllerPos.x + x
      const yPos = controllerPos.y + y
      const notBlockingSources = colonySourcePositions.every(({ x, y }) => {
        return xPos !== x || yPos !== y
      })
      if (!notBlockingSources) continue
      const wall = getXYWall(room, xPos, yPos)
      if (wall) continue
      const result = room.createConstructionSite(xPos, yPos, STRUCTURE_WALL)
      if (result === 0) return SUCCESS
    }
  if (minDecay === Infinity) minDecay = 1
  mem._shielded = Game.time + minDecay
  console.log('Decay ' + room.name + ': ' + minDecay)
  return NOTHING_TODO
}
