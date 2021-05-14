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
    if (!this.targets.length) return 0
    const minimalShots = Math.ceil(
      _.max(this.targets.map((t) => t.hits)) / NUKE_DAMAGE[0],
    )
    if (minimalShots > this.maxShots) {
      console.log('Nuke search fast fail: ', minimalShots, this.maxShots)
      return Infinity
    } else if (this.targets.length === 1) {
      console.log('Nuke search fast result: ', minimalShots, this.maxShots)
      return minimalShots
    }

    for (let shots = minimalShots; shots <= this.maxShots; shots++) {
      const combis = this.targets.length * combinations.length
      const combiVec = new Uint8Array(shots + 1)
      if (this.boom(combiVec)) return shots
      while (!combiVec[shots]) {
        this.unStampHits(...this.combiTargetXY(combiVec[0]))
        combiVec[0]++
        for (let i = 0; i < shots; i++) {
          if (combiVec[i] >= combis) {
            combiVec[i] = 0
            if (this.stampHits(...this.combiTargetXY(combiVec[i]))) return shots
            this.unStampHits(...this.combiTargetXY(combiVec[i + 1]))
            combiVec[i + 1]++
          } else {
            if (this.stampHits(...this.combiTargetXY(combiVec[i]))) return shots
            break
          }
        }
      }
      this.stampHits(...this.combiTargetXY(0))
      this.unBoom(combiVec)
    }

    return Infinity
  }

  combiTargetXY(id: number): [number, number] {
    const combi = combinations[id % combinations.length]
    const target = this.targets[Math.floor(id / combinations.length)]
    const x = target.x + combi[0]
    const y = target.y + combi[1]
    return [x, y]
  }

  boom(combiVec: Uint8Array) {
    let result = false
    combiVec.slice(0, combiVec.length - 1).forEach((c) => {
      result = this.stampHits(...this.combiTargetXY(c))
    })
    return result
  }

  unBoom(combiVec: Uint8Array) {
    combiVec.slice(0, combiVec.length - 1).forEach((c) => {
      this.unStampHits(...this.combiTargetXY(c))
    })
  }

  stampHits(x: number, y: number) {
    let destroyed = 0
    this.targets.forEach((t) => {
      if (x === t.x && x === t.y) t.hits -= NUKE_DAMAGE[0]
      if (range(x - t.x, y - t.y) <= NUKE_IMPACT_RANGE)
        t.hits -= NUKE_DAMAGE[NUKE_IMPACT_RANGE]
      if (t.hits < 0) destroyed++
    })
    return destroyed === this.targets.length
  }

  unStampHits(x: number, y: number) {
    this.targets.forEach((t) => {
      if (x === t.x && x === t.y) t.hits += NUKE_DAMAGE[0]
      if (range(x - t.x, y - t.y) <= NUKE_IMPACT_RANGE)
        t.hits += NUKE_DAMAGE[NUKE_IMPACT_RANGE]
    })
  }
}
