const timers = [10, 10, 10]
const dataRetension = 100

export const enum Measurement {
  CPU_INTERVAL,
}

const timerIds: Record<Measurement, number[]> = {
  [Measurement.CPU_INTERVAL]: [1, 2, 3]
}

const timerMeaners: Record<Measurement, number[]> = {
  [Measurement.CPU_INTERVAL]: [100, 10, 10]
}

const measurementFunctions: Record<Measurement, () => string> = {
  [Measurement.CPU_INTERVAL]: () => String.fromCharCode(Math.round((Game.cpu.getUsed() * 100)))
}

function pushData(data: string, nextData: string) {
  let newData = data + nextData
  const truncateCount = newData.length - dataRetension
  if (truncateCount > 0) newData = newData.slice(truncateCount)
  return newData
}

function handleTimerDataType(i: number, type: Measurement, data?: string[]) {
  if (!data) return
  const dataIndex = timerIds[type].findIndex(v => v === i)
  if (dataIndex === -1) return
  const strData = data[dataIndex].slice(0, timerMeaners[type][dataIndex])
  const mean = Math.round(strData.split('').reduce((t, v) => t + v.charCodeAt(0), 0) / strData.length)
  data[dataIndex + 1] = pushData(data[dataIndex + 1] || '', String.fromCharCode(mean))
}

function handleTimerData(data: Stats["data"], i: number) {
  handleTimerDataType(i, Measurement.CPU_INTERVAL, data[Measurement.CPU_INTERVAL])
}

export function handleTimers(stats?: Stats) {
  if (!stats) return
  stats.timers.some((v, i) => {
    let newVal = v + 1
    if (newVal === timers[i]) {
      stats.timers[i] = 0
      handleTimerData(stats.data, i)
      return false
    }
    stats.timers[i] = newVal
    return true
  })
}

export function processData(type: Measurement) {
  const stats = Memory._stats || (Memory._stats = {
    timers: timers.map(() => 0),
    data: {}
  })

  const data = stats.data[type] || (stats.data[type] = new Array(timers.length + 1).fill(''))
  data[0] = pushData(data[0], measurementFunctions[type]())
  return true
}

export default function handleStats() {
  processData(Measurement.CPU_INTERVAL)
  handleTimers(Memory._stats)
}
