import _ from 'lodash'

export function charCodeIterator<T>(chars: string, iterator: (charCode: number, i: number, c: number) => void, start: number = 0): T | void {
  const times = chars.length
  let iteration = start
  for (let i = 0; i < times; i++) {
    const charCode = chars.charCodeAt(iteration)
    const result = iterator(charCode, i, iteration)
    if (!_.isUndefined(result)) return result
    if (++iteration >= times) iteration = 0
  }
}

export default function charPosIterator<T>(chars: string, iterator: (x: number, y: number, xy: number, i: number, c: number) => T, start: number = 0): T | void {
  return charCodeIterator(chars, (xy, i, c) => iterator(xy & 63, xy >> 6, xy, i, c), start)
}
