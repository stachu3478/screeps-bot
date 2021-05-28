import 'overloads/all'
import run from 'room/core'
import profiler from 'screeps-profiler'
import 'utils/profiler'
import handleStats, { saveCpuUsage } from 'utils/stats'
import visual from 'planner/visual'
import roomVisual from 'utils/visual'
import { memHackBeforeLoop, memHackAfterLoop } from 'utils/memHack'
import pixelsHandler from 'utils/pixelsHandler'
import handleRuntimeStats from 'utils/runtime'
import MainNuker from 'planner/military/MainNuker'
import MyRooms from 'room/MyRooms'

export const loop = () => {
  memHackBeforeLoop()

  const rooms = MyRooms.get()
  let error
  try {
    profiler.wrap(() => {
      let usage = Game.cpu.getUsed()
      roomVisual.info('Memory overhead: ' + usage.toFixed(3), 0, 49)
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
  MainNuker.instance.work()
  if (error) throw error
}
