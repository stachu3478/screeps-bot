export default class ArrayLooper<T> {
  private array: T[]
  private index: number

  constructor(array: T[], startIndex: number = 0) {
    this.array = array
    this.index = startIndex
  }

  get current() {
    return this.array[this.index]
  }

  get next() {
    if (this.end) this.index = 0
    else this.index++
    return this.current
  }

  get i() {
    return this.index
  }

  get end() {
    return this.array.length - 1 === this.index
  }
}
