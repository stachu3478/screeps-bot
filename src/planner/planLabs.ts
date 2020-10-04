import PlannerMatrix from './matrix'
import xyToChar from './pos'
import charPosIterator from 'utils/charPosIterator'

export default {
  run: function run(room: Room) {
    if (!room.controller) return
    const mem = room.memory
    if (!mem.structs) return
    const terrain = room.getTerrain()
    const pm = new PlannerMatrix(terrain)
    pm.coverBorder()

    const structPoses = mem.structs.substr(12)
    const targetPos = mem.structs.charCodeAt(0)
    charPosIterator(structPoses, (xp, yp) => {
      pm.setField(xp, yp, 3)
    })

    const labRequirement = CONTROLLER_STRUCTURES[STRUCTURE_LAB][8]
    const matrix = pm.getMatrix()
    let bestInternalPoses: number[] = []
    let bestExternalPoses: number[] = []
    let bestTotalPoses = 0
    let bestDistance = 0
    charPosIterator(structPoses, (xp, yp) => {
      let internalPoses = []
      let externalPoses = []
      for (let x = -1; x < 3; x++)
        for (let y = -1; y < 3; y++) {
          const xpos = xp + x
          const ypos = yp + y
          const pos = xyToChar(xpos, ypos)
          if (matrix[pos] === 3) {
            if (x === -1 || x === 2 || y === -1 || y === 2) {
              externalPoses.push(pos)
            } else {
              internalPoses.push(pos)
            }
          }
        }
      const totalPoses = internalPoses.length + externalPoses.length
      const distance = Math.max(
        Math.abs(xp - (targetPos & 63)),
        Math.abs(yp - (targetPos >> 6)),
      )
      if (internalPoses.length < 2) return
      if (totalPoses >= labRequirement) {
        if (bestDistance > distance || bestTotalPoses < labRequirement) {
          bestInternalPoses = internalPoses
          bestExternalPoses = externalPoses
          bestTotalPoses = totalPoses
          bestDistance = distance
        }
      } else if (totalPoses > bestTotalPoses) {
        bestInternalPoses = internalPoses
        bestExternalPoses = externalPoses
        bestTotalPoses = totalPoses
        bestDistance = distance
      }
    })

    while (bestInternalPoses.length > 2) {
      bestExternalPoses.push(bestInternalPoses.pop() || 0)
    }
    bestInternalPoses.forEach((xy) => {
      pm.setField(xy & 63, xy >> 6, 2)
    })
    bestExternalPoses.forEach((xy) => {
      pm.setField(xy & 63, xy >> 6, 1)
    })

    const newStructs: number[] = []
    pm.each((v, xy) => {
      if (v === 3) newStructs.push(xy)
    })
    mem.structs = mem.structs.substr(0, 12) + String.fromCharCode(...newStructs)
    mem.internalLabs = String.fromCharCode(...bestInternalPoses)
    mem.externalLabs = String.fromCharCode(...bestExternalPoses)
  },
}
