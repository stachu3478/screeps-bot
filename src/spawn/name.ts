export function uniqName(start: string) {
  let time = 0
  let name = start + time
  while (Game.creeps[name] || Memory.creeps[name]) {
    name = start + ++time
  }
  return name
}
