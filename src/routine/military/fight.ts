import { cheapMove } from "utils/path";
import { NOTHING_DONE, FAILED, NOTHING_TODO, SUCCESS } from "constants/response";

interface FightCreep extends Creep {
  memory: FightMemory
}

interface FightMemory extends CreepMemory { }

export default function fight(creep: FightCreep, enemy?: Creep) {
  if (!enemy) return NOTHING_TODO
  if (!creep.pos.isNearTo(enemy)) {
    cheapMove(creep, enemy)
    return NOTHING_DONE
  }
  if (creep.attack(enemy) !== 0) return FAILED
  return SUCCESS
}
