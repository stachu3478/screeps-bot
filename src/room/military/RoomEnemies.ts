import enemies from 'config/enemies'
import EnemiesPlanner from 'planner/military/EnemiesPlanner'

export default class RoomEnemies {
  private static harmlessBodyparts: Set<BodyPartConstant> = new Set([
    MOVE,
    CARRY,
    TOUGH,
  ])
  private room: Room
  private enemies = EnemiesPlanner.instance

  constructor(room: Room) {
    this.room = room
  }

  find() {
    return this.room.find(FIND_HOSTILE_CREEPS, {
      filter: (creep) => this.isEnemy(creep),
    })
  }

  private isEnemy(creep: Creep) {
    const username = creep.owner.username
    if (this.enemies.isEnemy(username)) return true
    const tolerance = enemies.allies[username] || 0
    const harmfulParts = this.getHarmfulBodypartCount(creep)
    const passes = harmfulParts <= tolerance
    if (!passes) delete enemies.allies[username]
    return !passes
  }

  private getHarmfulBodypartCount(creep: Creep) {
    return creep.body.reduce(
      (t, part) => t + (RoomEnemies.harmlessBodyparts.has(part.type) ? 1 : 0),
      0,
    )
  }
}
