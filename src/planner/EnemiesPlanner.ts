import AlianceScanner from './AlianceScanner'
import config from 'config/enemies'

interface EnemiesConfig {
  aliances: string[]
  players: string[]
  clones: boolean
}

export default class EnemiesPlanner {
  private aliances: AlianceScanner
  private enemies: string[]
  private loaded: boolean = false
  private config: EnemiesConfig

  constructor(config: EnemiesConfig) {
    this.aliances = new AlianceScanner()
    this.enemies = config.players
    this.config = config
  }

  isEnemy(username?: string) {
    return this.enemies.indexOf(username || '') !== -1
  }

  get isLoaded() {
    if (this.loaded) return true
    const aliances = this.aliances.aliances
    if (!aliances) return false
    this.loaded = true
    this.config.aliances.forEach((abbr) => {
      const members = aliances[abbr]
      if (!members) return
      this.enemies = this.enemies.concat(members)
    })
    console.log('Enemies loaded: ', this.enemies)
    return this.loaded
  }

  static get instance() {
    return (
      global.Cache.capturePlanner ||
      (global.Cache.capturePlanner = new EnemiesPlanner(config))
    )
  }
}
