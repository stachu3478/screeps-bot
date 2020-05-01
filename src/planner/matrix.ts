import pos from './pos'

export default class PlannerMatrix {
  private matrix: Int8Array
  private terrain: RoomTerrain
  private roadCount: number
  private structuresCount: number

  constructor(terrain: RoomTerrain) {
    this.matrix = new Int8Array(4096)
    this.terrain = terrain
    this.roadCount = 0
    this.structuresCount = 0
  }

  getMatrix() {
    return this.matrix
  }

  getRoadCount() {
    return this.roadCount
  }

  getStructuresCount() {
    return this.structuresCount
  }

  setField(x: number, y: number, v: number, expl: boolean = false) {
    this.setFieldRef(pos(x, y), v, expl)
  }

  setFieldRef(xy: number, v: number, expl: boolean = false) {
    const { matrix } = this
    if ((matrix[xy] || 127 < v) && !expl) return
    if (matrix[xy] > 0) this.roadCount--
    if (v > 0) this.roadCount++
    if (matrix[xy] === -1) this.structuresCount--
    if (v === -1) this.structuresCount++
    matrix[xy] = v
  }

  rankPos(x: number, y: number) {
    const { matrix, terrain } = this
    if (matrix[pos(x, y)] > 0 || terrain.get(x, y) === 1) return -Infinity
    let rank = -1
    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++) {
        const xy = pos(x + ox, y + oy)
        if (matrix[xy] === 0 && terrain.get(x + ox, y + oy) !== 1) rank++
      }
    return rank
  }

  getBestPos(x: number, y: number) {
    let bestPos = pos(x, y)
    let bestRank = 0
    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++) {
        const result = this.rankPos(x + ox, y + oy)
        if (result > bestRank) {
          bestRank = result
          bestPos = pos(x + ox, y + oy)
        }
      }
    return {
      pos: bestPos,
      rank: bestRank
    }
  }

  getWeight(x: number, y: number) {
    const { matrix } = this
    let min = Infinity
    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++) {
        const xy = pos(x + ox, y + oy)
        if (matrix[xy] > 0) {
          min = Math.min(min, matrix[xy])
        }
      }
    return min
  }

  coverBorder() {
    for (let x = 0; x < 50; x++) {
      this.setField(x, 0, -127)
      this.setField(x, 49, -127)
    }
    for (let y = 0; y < 50; y++) {
      this.setField(0, y, -127)
      this.setField(49, y, -127)
    }
  }

  each(iteratee: (value: number, xy: number, x: number, y: number) => void) {
    const { matrix } = this
    for (let x = 0; x < 50; x++)
      for (let y = 0; y < 50; y++) {
        const xy = pos(x, y)
        iteratee(matrix[xy], xy, x, y)
      }
  }
}
