import _ from 'lodash'
import AlianceScanner from './AlianceScanner'
import config from 'config/enemies'
import CloneScanner from './CloneScanner'

export interface EnemiesConfig {
  enableWar: boolean
  aliances: string[]
  players: string[]
  tradeShutdown: string[]
  clones: boolean
  maxCost: number
  nukes: boolean
  allies: {
    [key: string]: number | undefined
  }
}

const instance = _.memoize(() => new EnemiesPlanner(config))
export default class EnemiesPlanner {
  private aliances: AlianceScanner
  private aliancesLoaded: boolean = false
  private clones: CloneScanner
  private clonesLoaded: boolean = false
  private enemies: string[]
  private config: EnemiesConfig

  constructor(config: EnemiesConfig) {
    this.aliances = new AlianceScanner()
    this.clones = new CloneScanner()
    this.enemies = config.players
    this.config = config
  }

  isTradeDisallowed(username?: string) {
    return (
      this.config.tradeShutdown.indexOf(username || '') !== -1 ||
      this.isEnemy(username)
    )
  }

  isEnemy(username?: string) {
    return this.enemies.indexOf(username || '') !== -1
  }

  get isLoaded() {
    if (!this.config.enableWar) return false
    if (this.loaded) return true
    this.loadAliances()
    this.loadClones()
    if (this.loaded) console.log('Enemies loaded: ', this.enemies)
    return this.loaded
  }

  private loadAliances() {
    if (this.aliancesLoaded) return
    const aliances = this.aliances.aliances
    if (!aliances) return
    this.aliancesLoaded = true
    this.config.aliances.forEach((abbr) => {
      const members = aliances[abbr]
      if (!members) return
      this.enemies = this.enemies.concat(members)
    })
  }

  private loadClones() {
    if (this.clonesLoaded) return
    if (!this.config.clones) {
      this.clonesLoaded = true
      return
    }
    const clones = this.clones.clones
    if (!clones) return
    this.clonesLoaded = true
    Object.keys(clones).forEach((abbr) => {
      const members = clones[abbr].members
      if (!members) return
      this.enemies = this.enemies.concat(members)
    })
  }

  private get loaded() {
    return this.aliancesLoaded && this.clonesLoaded
  }

  static get instance() {
    return instance()
  }
}
