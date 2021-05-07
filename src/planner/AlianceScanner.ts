export default class AlianceScanner {
  private result?: { [key: string]: string[] }
  private fetchTime: number

  constructor() {
    this.fetchTime = -1
    this.fetch()
  }

  private fetch() {
    if (this.fetchTime === Game.time) return
    RawMemory.setActiveForeignSegment('LeagueOfAutomatedNations', 99)
    this.fetchTime = Game.time
  }

  get aliances() {
    if (this.result) return this.result
    if (this.fetchTime !== Game.time - 1) {
      this.fetch()
      return
    }
    try {
      this.result = JSON.parse(RawMemory.foreignSegment.data)
      if (!this.result) return this.fetch()
    } catch (err) {
      console.log('Error parsing aliance data:', err)
    }
    return this.result
  }
}
