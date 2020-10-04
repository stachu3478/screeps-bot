import PlannerMatrix from './matrix'
import xyToChar from './pos'
import charPosIterator from 'utils/charPosIterator'

export default function planShields(room: Room) {
  // TODO finish
  if (!room.controller) return
  const mem = room.memory
  if (!mem.structs) return
  const terrain = room.getTerrain()
  const pm = new PlannerMatrix(terrain)
  pm.coverBorder(1)
  const exits = room.find(FIND_EXIT_TOP)

  const densityArray = new Float32Array(4096)
  let activeArray: number[] = []
  let maxDensity = 1
  // cover exits where wall and rampart cannot be placed
  exits.forEach((position) => {
    for (let x = -2; x < 3; x++)
      for (let y = -2; y < 3; y++) {
        let xpos = position.x + x
        let ypos = position.y + y
        if (xpos < 0 && ypos < 0) continue
        if (Math.max(Math.abs(x), Math.abs(y)) === 2) {
          const xypos = xyToChar(xpos, ypos)
          densityArray[xypos] = 1.0
          activeArray.push(xypos)
        } else pm.setField(xpos, ypos, -127)
      }
  })

  charPosIterator(mem.structs, (xp, yp) => {
    for (let x = -2; x < 3; x++)
      for (let y = -2; y < 3; y++) {
        let xpos = xp + x
        let ypos = yp + y
        if (xpos < 0 && ypos < 0) continue
        pm.setField(xpos, ypos, -126)
      }
  })

  const matrix = pm.getMatrix()
  while (activeArray.length > 0) {
    const newActive: number[] = []
    activeArray.forEach((xy) => {
      const xp = xy & 63
      const yp = xy >> 6
      let lowest: number[] = []
      let lowestVal = Infinity
      const currentVal = densityArray[xy]
      let left = false
      for (let x = -1; x < 2; x++)
        for (let y = -1; y < 2; y++) {
          let xpos = xp + x
          let ypos = yp + y
          if (xpos < 0 && ypos < 0) continue
          const xypos = xyToChar(xpos, ypos)
          if (matrix[xypos] === -127) continue
          if (matrix[xypos] === -126) {
            left = true
            break
          }
          if (terrain.get(xpos, ypos) === TERRAIN_MASK_WALL) continue
          const val = densityArray[xypos]
          if (val < lowestVal) {
            lowest = [xypos]
            lowestVal = val
          } else if (val === lowestVal) {
            lowest.push(xypos)
          }
        }
      if (lowestVal >= currentVal || left) return
      const denseIncrease = (currentVal - lowestVal) / lowest.length
      lowest.forEach((xy) => {
        newActive.push(xy)
        densityArray[xy] += denseIncrease
        if (densityArray[xy] > maxDensity) maxDensity = densityArray[xy]
      })
    })
    activeArray = newActive
  }

  const vis = room.visual
  for (let x = 0; x < 50; x++)
    for (let y = 0; y < 50; y++) {
      const xy = xyToChar(x, y)
      if (matrix[xy] === -126)
        vis.rect(x - 0.25, y - 0.25, 0.5, 0.5, { fill: '#ff8' })
      else if (matrix[xy] === -127)
        vis.rect(x - 0.25, y - 0.25, 0.5, 0.5, { fill: '#888' })
      else {
        const size = densityArray[xy] / maxDensity
        vis.rect(x - size / 2, y - size / 2, size, size, { fill: '#88f' })
      }
    }
}
