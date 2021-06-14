import _ from 'lodash'

interface SegmentToRead {
  name: string
  id: number
}
const instance = _.memoize(
  () => new SegmentReader(),
  () => 'a',
)
export default class SegmentReader {
  private toRead: SegmentToRead[]

  constructor() {
    this.toRead = []
  }

  read(name: string, id: number): string | void {
    const segment = RawMemory.foreignSegment
    const index = this.toRead.findIndex((s) => s.name === name && s.id === id)
    if (segment && segment.username === name && segment.id === id) {
      if (index !== -1) this.toRead.splice(index, 1)
      return segment.data
    } else {
      if (index === -1) this.toRead.push({ name, id })
      if (this.toRead.length === 1) RawMemory.setActiveForeignSegment(name, id)
    }
  }

  static get instance() {
    return instance()
  }
}
