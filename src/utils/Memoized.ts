export default class Memoized<T extends { id: Id<T> }> {
  private t?: T

  constructor(t?: T) {
    this.t = t
  }

  get object() {
    const id = this.t ? this.t.id : ('' as Id<T>)
    return Game.getObjectById(id)
  }

  get permitted() {
    const object = this.object
    if (!object) {
      throw new Error('Memoized object not found')
    }
    return object
  }
}
