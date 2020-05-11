export default function whirl(sx: number, sy: number, cb: (x: number, y: number) => boolean) {
  let xPos = sx
  let yPos = sy
  let xDir = 1
  let yDir = 0
  let toChange = 0.5
  while (1) {
    for (let j = 0; j < toChange; j++) {
      xPos += xDir
      yPos += yDir
      if (cb(xPos, yPos)) return
    }
    const prevX = xDir
    xDir = yDir
    yDir = -prevX
    toChange += 0.5
  }
}
