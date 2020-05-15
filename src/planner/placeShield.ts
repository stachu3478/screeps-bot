import { SUCCESS, NOTHING_TODO, DONE } from '../constants/response'
import { getXYSpawn, getXYTower, getXYRampart, getXYWall } from 'utils/selectFromPos';

export default function placeShield(room: Room) {
  const controller = room.controller
  if (!controller) return NOTHING_TODO
  const mem = room.memory
  if (mem._shielded) return NOTHING_TODO
  if (!mem.structs) return NOTHING_TODO
  const structs = mem.structs

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
    if (rampart) continue
    const result = room.createConstructionSite(x, y, STRUCTURE_RAMPART)
    if (result === 0) return SUCCESS
  }

  const controllerPos = controller.pos
  for (let x = -1; x < 2; x++)
    for (let y = -1; y < 2; y++) {
      const wall = getXYWall(room, controllerPos.x + x, controllerPos.y + y)
      if (wall) continue
      const result = room.createConstructionSite(x, y, STRUCTURE_WALL)
      if (result === 0) return SUCCESS
    }
  mem._shielded = 1
  return NOTHING_TODO
}
