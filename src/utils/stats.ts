import { charCodeIterator } from './charPosIterator'
import roomVisual from 'utils/visual'
import { polyRect } from 'planner/visual'

const timers = [10, 10, 10]
const dataRetension = 100
let lastCpuUsage = 0

export const enum Measurement {
  CPU_INTERVAL,
}

const timerIds: Record<Measurement, number[]> = {
  [Measurement.CPU_INTERVAL]: [1, 2, 3],
}

const timerMeaners: Record<Measurement, number[]> = {
  [Measurement.CPU_INTERVAL]: [100, 10, 10],
}

const measurementFunctions: Record<Measurement, () => string> = {
  [Measurement.CPU_INTERVAL]: () =>
    String.fromCharCode(Math.round((lastCpuUsage || Game.cpu.getUsed()) * 100)),
}

function pushData(data: string, nextData: string) {
  let newData = data + nextData
  const truncateCount = newData.length - dataRetension
  if (truncateCount > 0) newData = newData.slice(truncateCount)
  return newData
}

function handleTimerDataType(i: number, type: Measurement, data?: string[]) {
  if (!data) return
  const dataIndex = timerIds[type].findIndex((v) => v === i)
  if (dataIndex === -1) return
  const strData = data[dataIndex].slice(0, timerMeaners[type][dataIndex])
  const mean = Math.round(
    strData.split('').reduce((t, v) => t + v.charCodeAt(0), 0) / strData.length,
  )
  data[dataIndex + 1] = pushData(
    data[dataIndex + 1] || '',
    String.fromCharCode(mean),
  )
}

function handleTimerData(data: Stats['data'], i: number) {
  handleTimerDataType(
    i,
    Measurement.CPU_INTERVAL,
    data[Measurement.CPU_INTERVAL],
  )
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
  const stats =
    Memory._stats ||
    (Memory._stats = {
      timers: timers.map(() => 0),
      data: {},
    })

  const data =
    stats.data[type] ||
    (stats.data[type] = new Array(timers.length + 1).fill(''))
  data[0] = pushData(data[0], measurementFunctions[type]())
  return true
}

function visualizeCpuUsage(charCode: number) {
  return charCode / 100
}

function normalize(
  normMin: number,
  w: number,
  current: number,
  currentMax: number,
) {
  return normMin + (w * current) / currentMax
}

const statRectStyle: PolyStyle = {
  stroke: '#2b1',
  fill: '#0000',
  strokeWidth: 0.05,
}
const statFillStyle: PolyStyle = {
  stroke: '#3f34',
  fill: '#3f34',
  strokeWidth: 0,
}
const statLineStyle: LineStyle = { color: '#2b1', width: 0.05 }
function horizontalLine(x1: number, x2: number, y: number) {
  roomVisual.line(x1, y, x2, y, statLineStyle)
}
class Chart {
  private x1: number
  private y1: number
  private x2: number
  private y2: number
  private w: number
  private h: number
  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.w = x2 - x1
    this.h = y2 - y1
  }

  createFrame() {
    roomVisual.rect(this.x1, this.y1, this.w, this.h, statRectStyle)
    horizontalLine(this.x1, this.x2, (this.y1 * 3 + this.y2) / 4)
    horizontalLine(this.x1, this.x2, (this.y1 + this.y2) / 2)
    horizontalLine(this.x1, this.x2, (this.y1 + this.y2 * 3) / 4)
  }

  visualizeData(
    data: string,
    method: (charCode: number) => number,
    maxValue: number,
  ) {
    this.createFrame()
    const count = data.length
    let prevX = this.x1
    let prevY = this.y1
    charCodeIterator(data, (charCode, i) => {
      const value = method(charCode)
      const currentX = this.normalizeX(i, count)
      const currentY = this.normalizeY(-value, maxValue)
      roomVisual.line(prevX, prevY, currentX, currentY, statLineStyle)
      prevX = currentX
      prevY = currentY
      roomVisual.poly(
        polyRect([
          [prevX, prevY],
          [currentX, currentY],
          [currentX, this.y2],
          [prevX, this.y2],
        ]),
        statFillStyle,
      )
    })
  }

  normalizeX(value: number, maxValue: number) {
    return normalize(this.x1, this.w, value, maxValue)
  }

  normalizeY(value: number, maxValue: number) {
    return normalize(this.y2, this.h, value, maxValue)
  }
}

const cpu1Visual = new Chart(40, 1, 49, 5)
const cpu100Visual = new Chart(40, 6, 49, 10)
export function vizualizeStats(stats: Stats) {
  const cpuData = stats.data[Measurement.CPU_INTERVAL]
  if (!cpuData) return
  const cpu1Data = cpuData[0] || ''
  cpu1Visual.visualizeData(cpu1Data, visualizeCpuUsage, Game.cpu.limit)
  const cpu100Data = cpuData[2] || ''
  cpu100Visual.visualizeData(cpu100Data, visualizeCpuUsage, Game.cpu.limit)
}

export function saveCpuUsage() {
  lastCpuUsage = Game.cpu.getUsed()
}

export default function handleStats() {
  processData(Measurement.CPU_INTERVAL)
  handleTimers(Memory._stats)
  if (Memory._stats) vizualizeStats(Memory._stats)
}
