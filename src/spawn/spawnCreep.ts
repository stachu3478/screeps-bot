export default abstract class SpawnCreep {
  protected spawn: StructureSpawn
  protected count: number
  protected maxCount = Infinity
  protected minEnergy: number = SPAWN_ENERGY_START
  protected allowWhenEnergyFull: boolean = false

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

  needs() {
    return this.count < this.maxCount && this.energySatisfied
  }
  abstract run(): void

  private get energySatisfied() {
    return (
      this.room.energyAvailable >= this.energyRequired ||
      (this.allowWhenEnergyFull &&
        this.room.energyAvailable === this.room.energyCapacityAvailable)
    )
  }

  protected get energyRequired(): number {
    return this.minEnergy
  }

  protected get room() {
    return this.spawn.room
  }

  get role(): Role {
    return Role.HARVESTER
  }
}
