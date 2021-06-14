import roomVisual from 'utils/visual'
import { collectGarbageAll } from './collectGarbage'

let runtimeTicks = 0
let wasReset = true

function handleRuntimeReset() {
  const currentResetTime = Memory.runtimeTicks || 0
  const avg = Memory.runtimeAvg || currentResetTime
  Memory.runtimeAvg = (avg * 9 + currentResetTime) / 10
  Memory.runtimeTicks = 0
  wasReset = false
  collectGarbageAll()
}

export default function handleRuntimeStats() {
  if (wasReset) handleRuntimeReset()
  Memory.runtimeTicks = runtimeTicks++
  roomVisual.info(
    'Runtime ticks: ' +
      runtimeTicks +
      ' (avg. ' +
      (Math.round(Memory.runtimeAvg || 0) || 'unknown') +
      ')',
    0,
    48,
  )
}
