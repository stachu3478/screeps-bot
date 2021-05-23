import _ from 'lodash'
import MyRooms from '../../room/MyRooms'
import ObservingScanner from '../../planner/ObservingScanner'
import NukePlanner from './NukePlanner'
import EnemiesPlanner from './EnemiesPlanner'
import config from '../../config/enemies'

const instance = _.memoize(() => new MainNuker())
export default class MainNuker {
  private saved = false
  private observingScanner = ObservingScanner.instance
  private enemiesPlanner = EnemiesPlanner.instance

  work() {
    if (!config.enableWar || !config.nukes) return
    if (!MyRooms.get().every((room) => room.pathScanner.done)) return
    if (this.saved) {
      this.observingScanner.scan((r) => {
        if (!this.enemiesPlanner.isEnemy(r.owner)) return
        const planner = new NukePlanner(r)
        if (planner.shouldNukeRoom() && planner.canNukeSpawns()) {
          Game.notify(
            `Room ${r.name} owned by ${r.owner} is about to be nuked!`,
          )
          planner.launch()
        }
        console.log('elo', r.name)
      })
    } else {
      this.observingScanner.filterToScanFromPathScanners()
      this.saved = true
      console.log('filtering')
    }
  }

  static get instance() {
    return instance()
  }
}
