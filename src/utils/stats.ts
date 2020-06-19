const timers = [10, 10, 10]
const dataRetension = 100

export const enum Measurement {
  CPU_INTERVAL,
}

const timerIds: Record<Measurement, number> = {
  [Measurement.CPU_INTERVAL]: 6
}

const measurementFunctions: Record<Measurement, () => string> = {
  [Measurement.CPU_INTERVAL]: () => String.fromCharCode(Math.round((Game.cpu.getUsed() * 100)))
}

export function handleTimers() {

}

export function processData(type: Measurement) {
  const stats = Memory.stats || (Memory.stats = {
    timers: timers.map(() => 0),
    data: {}
  })

  const data = stats.data[type] || (stats.data[type] = new Array(timers.length + 1).fill(''))
  data[0] += measurementFunctions[type]()
  const truncateCount = data[0].length - dataRetension
  if (truncateCount > 0) data[0] = data[0].slice(truncateCount)
  return true
}

export default function handleStats(statistics?: Stats) {
  //processData(Measurement.CPU_INTERVAL)

  return statistics
}
