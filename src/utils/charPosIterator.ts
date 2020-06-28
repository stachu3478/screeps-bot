import _ from 'lodash'

export default function charPosIterator<T>(chars: string, iterator: (x: number, y: number, xy: number, i: number, c: number) => T, start: number = 0): T | void {
  const times = chars.length
  let iteration = start
  for (let i = 0; i < times; i++) {
    const xy = chars.charCodeAt(iteration)
    const result = iterator(xy & 63, xy >> 6, xy, i, iteration)
    if (!_.isUndefined(result)) return result
    if (++iteration >= times) iteration = 0
  }
}
