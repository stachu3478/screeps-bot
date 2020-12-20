import xyToChar from 'planner/pos'

const feromonTochar = (roomName: string, x: number, y: number) => {
  return roomName + xyToChar(x, y)
}

/**
 * @module
 */
export default class Feromon {
  static _cache?: WrappedGlobalCache

  static set cache(v: WrappedGlobalCache) {
    this._cache = v
  }

  static get cache() {
    return this._cache || global.Cache
  }

  static collect(roomName: string, x: number, y: number, range = 1) {
    const map = this.cache.feromon
    let sum = 0
    for (let xp = x - range; xp <= x + range; xp++) {
      for (let yp = y - range; yp <= y + range; yp++) {
        sum += map[feromonTochar(roomName, xp, yp)] || 0
      }
    }
    return sum
  }

  static increment(roomName: string, x: number, y: number) {
    const key = feromonTochar(roomName, x, y)
    const map = this.cache.feromon
    if (map[key]) {
      map[key]++
    } else {
      map[key] = 1
    }
  }
}
