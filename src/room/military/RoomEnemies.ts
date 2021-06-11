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
    const creeps: AnyCreep[] = this.room.findHostileCreeps((creep) =>
      this.isEnemy(creep),
    )
    return creeps.concat(
      this.room.findHostilePowerCreeps((creep) => this.isEnemy(creep)),
    )
  }

  private isEnemy(creep: AnyCreep) {
    const username = creep.owner.username
    if (this.enemies.isEnemy(username)) return true
    const tolerance = enemies.allies[username] || 0
    const harmfulParts = this.getHarmfulBodypartCount(creep)
    const passes = harmfulParts <= tolerance
    if (!passes) delete enemies.allies[username]
    return !passes
  }

  private getHarmfulBodypartCount(creep: AnyCreep) {
    if (creep instanceof PowerCreep) return 0
    return creep.body.reduce(
      (t, part) => t + (RoomEnemies.harmlessBodyparts.has(part.type) ? 1 : 0),
      0,
    )
  }
}
