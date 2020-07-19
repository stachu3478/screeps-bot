import 'overloads/all'
import run from 'room/core'
import { infoStyle } from 'room/style';
import profiler from 'screeps-profiler'
import 'utils/profiler'
import handleStats, { saveCpuUsage } from 'utils/stats'
import visual from 'planner/visual'
import roomVisual from 'utils/visual'
import { memHackBeforeLoop, memHackAfterLoop } from 'utils/memHack';
import pixelsHandler from 'utils/pixelsHandler';
import handleRuntimeStats from 'utils/runtime';

export const loop = () => {
  memHackBeforeLoop()

  let error
  try {
    profiler.wrap(() => {
      Memory.myRooms
      let usage = Game.cpu.getUsed()
      roomVisual.text('Memory overhead: ' + usage.toFixed(3), 0, 49, infoStyle)
      for (const name in Memory.myRooms) {
        const room = Game.rooms[name]
        if (room) {
          if (room.controller) usage += run(room.controller, usage)
          else delete Memory.myRooms[name]
        }
      }

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
  if (error) throw error
}
