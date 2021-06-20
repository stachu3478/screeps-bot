export default class RemoteMiningMonitor {
  private visual: RoomVisual
  private profit = 0
  private use = 0
  private startTick = Game.time

  constructor(visual: RoomVisual) {
    this.visual = visual
  }

  monit(energy: number) {
    if (energy > 0) {
      this.profit += energy
    } else {
      this.use -= energy
    }
  }

  show() {
    const balance = this.profit - this.use
    const measureTime = Game.time - this.startTick
    const perTick = balance / measureTime
    this.visual.info(
      'Remote mining income: ' + this.profit + ' - ' + this.use,
      20,
      0,
    )
    this.visual.info('Per tick: ' + perTick.toPrecision(2), 20, 1)
  }
}
