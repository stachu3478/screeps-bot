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
import ClaimPlanner from 'planner/ClaimPlanner'

export const addFirstRoom = (game = Game, memory = Memory) => {
  // Automatically add first room to owned if there are none
  if (!memory.myRooms) memory.myRooms = {}
  if (!Object.keys(memory.myRooms)[0]) {
    const name = Object.keys(game.rooms)[0]
    if (name) memory.myRooms[name] = 0
  }
}

export const loop = () => {
  memHackBeforeLoop()

  let error
  try {
    profiler.wrap(() => {
      addFirstRoom()
      let usage = Game.cpu.getUsed()
      roomVisual.text('Memory overhead: ' + usage.toFixed(3), 0, 49, infoStyle)
      const roomsToRemove = new Set()
      for (const name in Memory.myRooms) {
        const room = Game.rooms[name]
        if (room) {
          if (room.controller) usage += run(room.controller, usage)
          else roomsToRemove.add(name)
        }
      }
      for (const room of roomsToRemove) delete Memory.myRooms[room]

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
  const target = ClaimPlanner.instance.target
  if (target)
    Game.rooms[target.source].memory[RoomMemoryKeys.claim] = target.target
  if (error) throw error
}
