import move from '../../utils/path/path'
import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from 'constants/response'

interface FightCreep extends Creep {
  memory: FightMemory
}

interface FightMemory extends CreepMemory {}

export default function fight(
  creep: FightCreep,
  enemy?: AnyCreep,
  keepDistance: boolean = false,
) {
  if (!enemy) return NOTHING_TODO
  if (keepDistance) {
    const range = creep.pos.rangeTo(enemy)
    creep.say(range.toString())
    if (range > 4) move.cheap(creep, enemy)
    else if (range < 4) move.anywhere(creep, enemy.pos.getDirectionTo(creep))
    return NOTHING_DONE
  }
  if (!creep.pos.isNearTo(enemy)) {
    move.cheap(creep, enemy)
    return NOTHING_DONE
  }
  if (creep.attack(enemy) !== 0) return FAILED
  return SUCCESS
}
