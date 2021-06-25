import arrive from 'routine/arrive'
import move from 'utils/path/path'

export default function reserver(creep: RoleCreep<Role.RESERVER>) {
  const target = creep.memory.reserve
  if (target !== creep.room.name) {
    arrive(creep, false, target)
  } else {
    const controller = Game.rooms[target]?.controller
    if (controller) {
      if (!creep.pos.isNearTo(controller)) {
        move.cheap(creep, controller, true, 1, 1)
        creep.say('Hello!')
      } else if (controller.attackable) {
        creep.attackController(controller)
        creep.say('*disclaimer*')
      } else {
        creep.reserveController(controller)
        creep.say('*reserve*')
      }
    }
  }
}
