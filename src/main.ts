import './overloads/Room'
import run from "room/core"
import { infoStyle } from "room/style";
import planShields from "planner/planShields";
import profiler from "screeps-profiler"

const memory = JSON.parse(RawMemory.get())
// profiler.enable()
const roomVisual = new RoomVisual()

let runtimeTicks = 0
export const loop = () => {
  delete global.Memory
  global.Memory = memory

  profiler.wrap(() => {
    Memory.myRooms
    let usage = Game.cpu.getUsed()
    roomVisual.text("Memory overhead: " + usage.toFixed(3), 0, 49, infoStyle)
    for (const name in Memory.myRooms) {
      const room = Game.rooms[name]
      if (room) {
        if (room.controller) usage += run(room.controller, usage)
        else delete Memory.myRooms[name]
      }
    }

    if (!Memory.runtimeTicks) Memory.runtimeTicks = runtimeTicks++
    else if (Memory.runtimeTicks > runtimeTicks) {
      const currentResetTime = Memory.runtimeTicks;
      let avg = Memory.runtimeAvg || currentResetTime
      Memory.runtimeAvg = avg = Math.floor((avg * 9 + currentResetTime) / 10)
      Memory.runtimeTicks = 0
    } else Memory.runtimeTicks = runtimeTicks++
    roomVisual.text("Runtime ticks: " + runtimeTicks + " (avg. " + (Memory.runtimeAvg || 'unknown') + ')', 0, 48, infoStyle)

    if (Game.rooms.sim) planShields(Game.rooms.sim)

    RawMemory.set(JSON.stringify(Memory))

  })
}
