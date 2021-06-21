import { INVADER_USERNAME, SOURCE_KEEPER_USERNAME } from 'constants/support'
import { EnemiesConfig } from 'planner/military/EnemiesPlanner'

const config: EnemiesConfig = {
  /**
   * Top switch to enable purging rooms
   */
  enableWar: true,
  /**
   * Choose aliances that have to be purged out
   */
  aliances: [], // ['UoP'],
  /**
   * Choose players that have to be purged out
   */
  players: [INVADER_USERNAME, SOURCE_KEEPER_USERNAME, 'Christianyo'],
  /**
   * Choose players that wont be attacked
   * (specify tolerance as max harmful bodypart count)
   */
  allies: {
    slyly: 25,
    Zhenya56554: 5,
  },
  /**
   * Specify that bot clones have to be purged out
   */
  clones: true,
  /**
   * Max path cost that the scoutes and observers
   * will scan rooms (for enemies) starting from the current one
   */
  maxCost: 250,
  /**
   * Enable nuking rooms
   */
  nukes: true,
}

export default config
