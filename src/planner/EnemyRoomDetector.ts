import EnemiesPlanner from './EnemiesPlanner'
import config from 'config/enemies'

export default class EnemyRoomDetector {
  private enemies: EnemiesPlanner
  private paths: RoomPathScanner
  private enemyRooms?: RoomNeighbourPath[]

  constructor(room: Room) {
    // @ts-ignore private property error
    this.enemies = EnemiesPlanner.instance
    this.paths = room.pathScanner
  }

  scan() {
    if (this.enemyRooms) return false
    if (!this.enemies.isLoaded) return false
    if (!this.paths.done) return false
    const roomPaths = this.paths.rooms
    this.enemyRooms = Object.keys(roomPaths)
      .filter((roomName) => {
        const room = roomPaths[roomName]
        if (!room) return false
        if (room.cost > config.maxCost) return false
        return this.enemies.isEnemy(room.owner)
      })
      .map((roomName) => roomPaths[roomName]!)
    this.enemyRooms.forEach((room) => {
      console.log('Enemy room found:', room.name, room.owner)
    })
    return true
  }
}
