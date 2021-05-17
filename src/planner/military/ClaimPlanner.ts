import config from 'config/claim'
import MyRooms from 'room/MyRooms'

export default class ClaimPlanner {
  private config: ClaimConfig
  private currentTarget?: ClaimTarget
  private searchTime: number = 0

  constructor(config: ClaimConfig) {
    this.config = config
  }

  get target(): ClaimTarget | null {
    this.invalidateTarget()
    if (this.currentTarget) return this.currentTarget
    if (this.searchTime === Game.time) return null
    this.searchTime = Game.time
    const rooms = MyRooms.get()
    if (rooms.length >= this.maxRooms) return null
    if (!rooms.every((r) => r.pathScanner.done)) {
      return null
    }
    console.log('looking for target')
    return this.findTarget(rooms)
  }

  private findTarget(rooms: Room[]) {
    let target = ''
    const source = rooms.find((r) => {
      const scannerRooms = r.pathScanner.rooms
      return Object.keys(scannerRooms).some((room) => {
        const passes = this.validateTarget(rooms, scannerRooms[room]!)
        if (passes) target = room
        return passes
      })
    })
    if (target === '' || !source) return null
    return (this.currentTarget = { source: source.name, target })
  }

  private validateTarget(rooms: Room[], info: RoomNeighbourPath) {
    return (
      !!info.controller &&
      !info.owner &&
      !!info.safe &&
      !info.controllerFortified &&
      info.cost >= this.minCost &&
      info.cost <= this.config.maxCost &&
      (info.sources || 0) >= this.config.minSources &&
      !rooms.some((r) => {
        const scannerRooms = r.pathScanner.rooms
        const scannerRoom = scannerRooms[info.name]
        if (!scannerRoom) return false
        return scannerRoom.cost < this.minCost
      })
    )
  }

  private invalidateTarget() {
    if (!this.currentTarget) return
    const room = Game.rooms[this.currentTarget.target]
    if (room && room.owner) delete this.currentTarget
  }

  private get minCost() {
    const shardConfig = this.config.shards[Game.shard.name]
    return shardConfig ? shardConfig.minCost : this.config.minCost
  }

  private get maxRooms() {
    const shardConfig = this.config.shards[Game.shard.name]
    return shardConfig ? shardConfig.maxRooms : this.config.maxRooms
  }

  static get instance() {
    return (
      global.Cache.claimPlanner ||
      (global.Cache.claimPlanner = new ClaimPlanner(config))
    )
  }
}
