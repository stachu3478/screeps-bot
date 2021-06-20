export default abstract class SpawnCreep {
  public role: Role = Role.HARVESTER
  protected spawn: StructureSpawn
  protected count: number

  constructor(spawn: StructureSpawn, creepCountByRole: number[]) {
    this.spawn = spawn
    this.count = creepCountByRole[this.role] || 0
  }

  static success(creepName: string, body: BodyPartConstant[]) {}
  static spawning(spawn: StructureSpawn) {}

  runIfNeeded() {
    const needs = this.needs()
    if (needs) {
      this.run()
    }
    return needs
  }

  abstract needs(): boolean
  abstract run(): void
}
