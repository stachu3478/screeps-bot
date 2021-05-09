import EnemiesPlanner from './EnemiesPlanner'

export default class EnemyRoomDetector {
  private enemies: EnemiesPlanner
  private paths: RoomPathScanner
  private enemyRooms?: RoomNeighbourPath[]

  constructor(room: Room) {
    this.enemies = EnemiesPlanner.instance
    this.paths = room.pathScanner
  }

  scan() {
    if (this.enemyRooms) return false
    if (!this.enemies.isLoaded) return false
    if (!this.paths.done) {
      this.paths.traverse()
      // todo auto traverse one room per tick
      return false
    }
    const roomPaths = this.paths.rooms
    this.enemyRooms = Object.keys(roomPaths)
      .filter((roomName) => {
        const room = roomPaths[roomName]
        if (!room) return false
        return this.enemies.isEnemy(room.owner)
      })
      .map((roomName) => roomPaths[roomName]!)
    this.enemyRooms.forEach((room) => {
      console.log('Enemy room found:', room.name, room.owner)
    })
    return true
  }
}
