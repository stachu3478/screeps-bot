export default class Memoized<T extends { id: Id<T> }> {
  private t: T

  constructor(t: T) {
    this.t = t
  }

  protected get object() {
    return Game.getObjectById(this.t.id)
  }
}
