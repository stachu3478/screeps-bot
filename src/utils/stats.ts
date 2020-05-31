export default function handleStats(statistics?: Stats) {
  const stats = statistics || {
    cpuInterval1: '',
    cpuInterval100: '',
    timer100: 100
  }

  stats.cpuInterval1 += String.fromCharCode(Math.round((Game.cpu.getUsed() * 100)))
  if (stats.timer100 <= 0) {
    stats.timer100 = 100
    stats.cpuInterval100 += String.fromCharCode(Math.round(stats.cpuInterval1.split('').reduce((n, char) =>
      n + char.charCodeAt(0)
      , 0) / 100))
    stats.cpuInterval100 = stats.cpuInterval100.substr(stats.cpuInterval100.length - 100)
    stats.cpuInterval1 = ''
  }

  stats.timer100--

  return stats
}
