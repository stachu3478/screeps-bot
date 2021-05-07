const enum RouteStatusKey {
  time = 0,
  timeout = 1,
}
// harmonic failer
export default class Failer {
  private decident: () => boolean
  private status: number[]

  constructor(decident: () => boolean, memory: number[]) {
    this.decident = decident
    this.status = memory || [Game.time, 0]
  }

  call() {
    if (Game.time < this.status[RouteStatusKey.time]) return false
    const result = this.decident()
    if (result) {
      this.status[RouteStatusKey.timeout] = 0
    } else {
      this.status[RouteStatusKey.timeout]++
      this.status[RouteStatusKey.time] =
        Game.time + this.status[RouteStatusKey.timeout]
    }
    return result
  }
}
