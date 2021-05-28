export default function usage(room: Room, then: number) {
  const cache = room.cache
  const currentUsage = Game.cpu.getUsed() - then
  let avg = cache.averageUsage || currentUsage
  const percent = Math.ceil(1000 * (currentUsage / Game.cpu.limit)) / 10
  cache.averageUsage = avg = (avg * 9 + percent) / 10
  room.visual.info(
    'Usage: ' + percent + '% (avg. ' + avg.toFixed(1) + '%)',
    0,
    2,
  )
  return currentUsage
}
