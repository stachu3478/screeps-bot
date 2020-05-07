import run from "room/core"

export const loop = () => {
  let usage = 0
  for (const name in Memory.myRooms) {
    const room = Game.rooms[name]
    if (room) {
      if (room.controller) usage += run(room as ControlledRoom, usage)
      else delete Game.rooms[name]
    }

  };
}
