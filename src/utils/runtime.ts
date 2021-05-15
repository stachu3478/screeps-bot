import roomVisual from 'utils/visual'
import { infoStyle } from 'room/style'
import { collectGarbageAll } from './collectGarbage'

let runtimeTicks = 0
let wasReset = true

function handleRuntimeReset() {
  const currentResetTime = Memory.runtimeTicks || 0
  const avg = Memory.runtimeAvg || currentResetTime
  Memory.runtimeAvg = Math.floor((avg * 9 + currentResetTime) / 10)
  Memory.runtimeTicks = 0
  wasReset = false
  collectGarbageAll()
}

export default function handleRuntimeStats() {
  if (wasReset) handleRuntimeReset()
  Memory.runtimeTicks = runtimeTicks++
  roomVisual.text(
    'Runtime ticks: ' +
      runtimeTicks +
      ' (avg. ' +
      (Memory.runtimeAvg || 'unknown') +
      ')',
    0,
    48,
    infoStyle,
  )
}
