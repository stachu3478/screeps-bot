import { infoStyle } from './style'

export default function usage(room: Room, then: number) {
  const currentUsage = Game.cpu.getUsed() - then;
  let avg = room.memory.averageUsage || currentUsage
  const percent = Math.ceil(1000 * (currentUsage / Game.cpu.limit)) / 10
  room.memory.averageUsage = avg = (avg * 9 + percent) / 10
  room.visual.text("Usage: " + percent + "% (avg. " + avg.toFixed(1) + "%)", 0, 2, infoStyle)
  return currentUsage
}
