import _ from 'lodash'
import range from 'utils/range'

interface NukeVoyagerTarget {
  x: number
  y: number
  hits: number
}

const NUKE_IMPACT_RANGE = _.max(
  Object.keys(NUKE_DAMAGE).map((r) => parseInt(r)),
)
const combinations = [
  [0, 0],
  [NUKE_IMPACT_RANGE, NUKE_IMPACT_RANGE],
  [-NUKE_IMPACT_RANGE, NUKE_IMPACT_RANGE],
  [NUKE_IMPACT_RANGE, -NUKE_IMPACT_RANGE],
  [-NUKE_IMPACT_RANGE, -NUKE_IMPACT_RANGE],
]
/**
 * Computes optimal amount of nukes to destroy all
 * targets specified
 * Compute warning:
 * CPU Gulper
 */
export default class NukeVoyager {
  private targets: NukeVoyagerTarget[]
  private maxShots: number

  constructor(targets: NukeVoyagerTarget[], maxShots: number) {
    this.targets = targets
    this.maxShots = maxShots
  }

  search() {
    if (!this.targets.length) return []
    const minimalShots = Math.ceil(
      _.max(this.targets.map((t) => t.hits)) / NUKE_DAMAGE[0],
    )
    if (minimalShots > this.maxShots) {
      console.log('Nuke search fast fail: ', minimalShots, this.maxShots)
      return []
    } else if (this.targets.length === 1) {
      console.log('Nuke search fast result: ', minimalShots, this.maxShots)
      const xy: [number, number] = [this.targets[0].x, this.targets[0].y]
      const res: [number, number][] = new Array(minimalShots).fill(xy)
      return res
    }

    for (let shots = minimalShots; shots <= this.maxShots; shots++) {
      const combis = this.targets.length * combinations.length
      const combiVec = new Array(shots + 1).fill(0)
      if (this.boom(combiVec)) return this.createResult(combiVec)
      while (!combiVec[shots]) {
        this.unStampHits(...this.combiTargetXY(combiVec[0]))
        combiVec[0]++
        for (let i = 0; i < shots; i++) {
          if (combiVec[i] >= combis) {
            combiVec[i] = 0
            this.stampHits(...this.combiTargetXY(combiVec[i]))
            if (i + 1 < shots)
              this.unStampHits(...this.combiTargetXY(combiVec[i + 1]))
            combiVec[i + 1]++
          } else {
            if (this.stampHits(...this.combiTargetXY(combiVec[i])))
              return this.createResult(combiVec)
            break
          }
        }
      }
      this.unBoom(combiVec)
    }
    return []
  }

  private createResult(vec: number[]) {
    return vec.slice(0, vec.length - 1).map((c) => {
      return this.combiTargetXY(c)
    })
  }

  private combiTargetXY(id: number): [number, number] {
    const combi = combinations[id % combinations.length]
    const target = this.targets[Math.floor(id / combinations.length)]
    const x = target.x + combi[0]
    const y = target.y + combi[1]
    return [x, y]
  }

  private boom(combiVec: number[]) {
    let result = false
    combiVec.slice(0, combiVec.length - 1).forEach((c) => {
      result = this.stampHits(...this.combiTargetXY(c))
    })
    return result
  }

  private unBoom(combiVec: number[]) {
    combiVec.slice(0, combiVec.length - 1).forEach((c) => {
      this.unStampHits(...this.combiTargetXY(c))
    })
  }

  private stampHits(x: number, y: number) {
    let destroyed = 0
    this.targets.forEach((t) => {
      if (x === t.x && y === t.y) t.hits -= NUKE_DAMAGE[0]
      else if (range(x - t.x, y - t.y) <= NUKE_IMPACT_RANGE)
        t.hits -= NUKE_DAMAGE[NUKE_IMPACT_RANGE]
      if (t.hits < 0) destroyed++
    })
    return destroyed === this.targets.length
  }

  private unStampHits(x: number, y: number) {
    this.targets.forEach((t) => {
      if (x === t.x && y === t.y) t.hits += NUKE_DAMAGE[0]
      else if (range(x - t.x, y - t.y) <= NUKE_IMPACT_RANGE)
        t.hits += NUKE_DAMAGE[NUKE_IMPACT_RANGE]
    })
  }
}
