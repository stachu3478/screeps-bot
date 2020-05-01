export default function xyToChar(x: number, y: number) { return (y << 6) + x }
export const posToChar = (pos: RoomPosition) => String.fromCharCode(xyToChar(pos.x, pos.y))
export const roomPos = (char: string, roomName: string) => {
  const code = char.charCodeAt(0)
  return new RoomPosition(code & 63, code >> 6, roomName)
}
