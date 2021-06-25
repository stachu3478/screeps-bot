import _ from 'lodash'

export function memoizeByRoom<T>(fn: (r: Room) => T) {
  return _.memoize(fn, (r: Room) => r.name)
}

export function memoizeBy<T, U>(fn: (t: _HasId & U) => T) {
  return _.memoize(fn, (t: _HasId) => t.id)
}
