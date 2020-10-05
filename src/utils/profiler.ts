import profiler from 'screeps-profiler'
import { profilerEnabled } from 'config/profiler'
import { getMemory } from './memHack'

if (profilerEnabled) profiler.enable()
else {
  const memory = getMemory()
  if (memory.profiler) {
    delete memory.profiler
    RawMemory.set(JSON.stringify(memory))
  }
}
