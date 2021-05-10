export default abstract class CreepMemoized<T extends Creep> {
  protected creepName: string
  constructor(creep: T) {
    this.creepName = creep.name
  }
  protected get creep() {
    return Game.creeps[this.creepName] as T
  }
}
