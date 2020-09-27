import profiler from 'screeps-profiler'
import { profilerEnabled } from 'config/profiler'

if (profilerEnabled) profiler.enable()
else {
  const memory = JSON.parse(RawMemory.get())
  if (memory.profiler) {
    delete memory.profiler
    RawMemory.set(JSON.stringify(memory))
  }
}
