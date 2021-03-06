import SpawnCreep from './spawnCreep'

export default class SpawnScout extends SpawnCreep {
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
    spawn.trySpawnCreep([MOVE], 'S', { role: this.role })
  }

  get role() {
    return Role.SCOUT
  }
}
