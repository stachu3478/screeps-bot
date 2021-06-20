import SpawnCreep from './spawnCreep'

export default class SpawnScout extends SpawnCreep {
  public role = Role.SCOUT

  static spawning(spawn: StructureSpawn) {
    spawn.room.cache.scoutsWorking++
  }

  needs() {
    const room = this.spawn.room
    return (
      !Game.rooms.sim &&
      !room.cache.scoutsWorking &&
      room.pathScanner.scanTarget
    )
  }

  run() {
    const spawn = this.spawn
    spawn.trySpawnCreep([MOVE], 'S', {
      role: this.role,
      room: spawn.room.name,
      deprivity: 0,
    })
  }
}
