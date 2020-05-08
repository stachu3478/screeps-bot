import run from "room/core"
import { infoStyle } from "room/style";
// import profiler from "screeps-profiler"

//profiler.enable()
export const loop = () => {
  //profiler.wrap(() => {
  Memory.myRooms
  let usage = Game.cpu.getUsed()
  new RoomVisual().text("Memory overhead: ".concat(usage.toFixed(3)), 0, 49, infoStyle)
  for (const name in Memory.myRooms) {
    const room = Game.rooms[name]
    if (room) {
      if (room.controller) usage += run(room as ControlledRoom, usage)
      else delete Game.rooms[name]
    }
  }
  //})
}
