export default {
  /**
   * Top switch to enable purging rooms
   */
  enableWar: false,
  /**
   * Choose aliances that have to be purged out
   */
  aliances: ['UoP'],
  /**
   * Choose players that have to be purged out
   */
  players: [],
  /**
   * Specify that bot clones have to be purged out
   */
  clones: true, // TODO: scan clones
  /**
   * Max path cost that the scoutes (TODO) and observers
   * will scan rooms starting of the current one
   */
  maxCost: 250,
  /**
   * Enable nuking rooms
   */
  nukes: false,
}
