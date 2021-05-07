interface Aliance {
  color: string
  rcl_rank: number
  spawns_rank: number
  logo: string
  members_rank: number
  slack_channel: string
  alliance_power_rank: number
  name: string
  combined_power_rank: number
  alliance_gcl_rank: number
  combined_gcl_rank: number
  abbreviation: string
  members: string[]
}

export default class AlianceScanner {
  private result?: { [key: string]: Aliance }
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
    } catch (err) {
      console.log('Error parsing aliance data:', err)
    }
    return this.result
  }
}
