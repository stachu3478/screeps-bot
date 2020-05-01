export function uniqName(start: string) {
  let time = 0
  while (Game.creeps[start + time]) time++
  return start + time
}
