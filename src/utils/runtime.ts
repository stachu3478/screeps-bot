import roomVisual from 'utils/visual'
import { infoStyle } from 'room/style';

let runtimeTicks = 0

function handleRuntimeReset(avg: number, currentResetTime: number) {
  Memory.runtimeAvg = avg = Math.floor((avg * 9 + currentResetTime) / 10)
  Memory.runtimeTicks = 0
}

const currentResetTime = Memory.runtimeTicks || 0
handleRuntimeReset(Memory.runtimeAvg || currentResetTime, currentResetTime)

export default function handleRuntimeStats() {
  Memory.runtimeTicks = runtimeTicks++
  roomVisual.text("Runtime ticks: " + runtimeTicks + " (avg. " + (Memory.runtimeAvg || 'unknown') + ')', 0, 48, infoStyle)
}
