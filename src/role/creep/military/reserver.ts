import arrive from 'routine/arrive'
import move from 'utils/path'

export interface Reserver extends Creep {
  memory: ReserverMemory
}

export interface ReserverMemory extends CreepMemory {
  role: Role.RESERVER
  reserve: string
  _arrive?: string
}

export default function reserver(creep: Reserver) {
  const target = creep.memory.reserve
  if (target !== creep.room.name) {
    creep.memory._arrive = target
    arrive(creep)
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
