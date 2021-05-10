import config from 'config/claim'

export default class ClaimPlanner {
  private config: ClaimConfig
  private currentTarget?: ClaimTarget

  constructor(config: ClaimConfig) {
    this.config = config
  }

  get target(): ClaimTarget | null {
    this.invalidateTarget()
    if (this.currentTarget) return this.currentTarget
    const roomNames = Object.keys(Memory.myRooms)
    if (roomNames.length >= this.maxRooms) {
      console.log('enough rooms claimed')
      return null
    }
    const rooms = roomNames.map((n) => Game.rooms[n])
    if (!rooms.every((r) => r.pathScanner.done)) {
      console.log('paths not scanned')
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
    return { source: source.name, target }
  }

  private validateTarget(rooms: Room[], info: RoomNeighbourPath) {
    return (
      !!info.controller &&
      !!info.owner &&
      info.cost >= this.minCost &&
      (info.sources || 0) >= this.config.minSources &&
      !rooms.some((r) => {
        const scannerRooms = r.pathScanner.rooms
        return Object.keys(scannerRooms).some(
          (i) => scannerRooms[i]!.cost < this.config.minCost,
        )
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
