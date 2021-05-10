import collectGarbage from 'utils/collectGarbage'

export function uniqName(start: string) {
  if (!Game.creeps[start]) return start
  let time = 0
  let name = start + time
  while (Game.creeps[name]) {
    name = start + ++time
  }
  collectGarbage(name)
  return name
}
