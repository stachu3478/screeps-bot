import 'overloads/all'
import run from 'room/core'
import { infoStyle } from 'room/style'
import profiler from 'screeps-profiler'
import 'utils/profiler'
import handleStats, { saveCpuUsage } from 'utils/stats'
import visual from 'planner/visual'
import roomVisual from 'utils/visual'
import { memHackBeforeLoop, memHackAfterLoop } from 'utils/memHack'
import pixelsHandler from 'utils/pixelsHandler'
import handleRuntimeStats from 'utils/runtime'
import ObservingScanner from 'planner/ObservingScanner'
import MyRooms from 'room/MyRooms'

let saved = false
export const loop = () => {
  memHackBeforeLoop()

  const rooms = MyRooms.get()
  let error
  try {
    profiler.wrap(() => {
      let usage = Game.cpu.getUsed()
      roomVisual.text('Memory overhead: ' + usage.toFixed(3), 0, 49, infoStyle)
      rooms.forEach((room) => {
        usage += run(room.controller, usage)
      })

      if (Memory.debugStructures)
        for (const name in Memory.myRooms) {
          const room = Game.rooms[name]
          if (room) visual(room)
        }
      handleRuntimeStats()
    })
  } catch (err) {
    error = err
  }

  pixelsHandler()
  handleStats()
  memHackAfterLoop()
  saveCpuUsage()
  if (rooms.every((room) => room.pathScanner.done)) {
    if (saved) {
      ObservingScanner.instance.scan((r) => {
        console.log('elo', r.name)
      })
    } else {
      ObservingScanner.instance.filterToScanFromPathScanners()
      saved = true
      console.log('filtering')
    }
  }
  if (error) throw error
}
