import xyToChar from 'planner/pos'

const feromonTochar = (roomName: string, x: number, y: number) => {
  return roomName + xyToChar(x, y)
}

export const getFeromon = (
  roomName: string,
  x: number,
  y: number,
  range = 1,
): number => {
  const map = global.Cache.feromon
  let sum = 0
  for (let xp = x - range; xp <= x + range; xp++) {
    for (let yp = y - range; yp <= y + range; yp++) {
      sum += map[feromonTochar(roomName, x, y)] || 0
    }
  }
  return sum
}

export const incrementFeromon = (roomName: string, x: number, y: number) => {
  const key = feromonTochar(roomName, x, y)
  if (global.Cache.feromon[key]) {
    global.Cache.feromon[key]++
  } else {
    global.Cache.feromon[key] = 1
  }
}
