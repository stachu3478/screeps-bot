import { roleBinding } from 'config/creeps'
import collectGarbage from 'utils/collectGarbage'
import ProfilerPlus from 'utils/ProfilerPlus'

interface Creeps {
  [key: string]: 0
}

export default ProfilerPlus.instance.overrideFn(function creeps(
  creeps: Creeps,
  room: Room,
) {
  const creepCountByRole: number[] = []
  let count = 0
  for (const name in creeps) {
    const creep = Game.creeps[name]
    if (!creep) {
      collectGarbage(name)
      continue
    }
    if (creep.memory.room !== room.name) {
      if (creep.room.name !== room.name) {
        if (room.memory.creeps) delete room.memory.creeps[name]
      } else {
        const otherMemRoom = Memory.rooms[creep.memory.room].creeps
        if (otherMemRoom) delete otherMemRoom[creep.name]
        creep.memory.room = room.name
      }
    }
    const role = creep.memory.role || 0
    if (!creep.isRetired) {
      if (role === Role.BOOSTER) {
        const targetRole =
          (creep as RoleCreep<Role.BOOSTER>).memory.newRole || 0
        creepCountByRole[targetRole] = (creepCountByRole[targetRole] || 0) + 1
      } else creepCountByRole[role] = (creepCountByRole[role] || 0) + 1
      count++
    } else
      creepCountByRole[Role.RETIRED] = (creepCountByRole[Role.RETIRED] || 0) + 1
    if (creep.spawning) continue
    try {
      const handler = roleBinding[creep.memory.role]
      if (handler) {
        handler(creep as RoleCreep<any>)
      }
    } catch (err) {
      console.log(err.message, err.stack)
    }
    creep.memory[Keys.lastRoom] = creep.room.name
    creep.memory[Keys.lastTicksToLive] = creep.ticksToLive
  }

  if (creepCountByRole[Role.DUAL] || room.memory[RoomMemoryKeys.ekhaust])
    room.duet.handle()

  return {
    creepCountByRole,
    count,
  }
},
'roomCreeps')
