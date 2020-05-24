import { IDLE, LAB_PENDING } from 'constants/state';
import { DONE, SUCCESS, NOTHING_DONE } from 'constants/response';
import { labProductionThreshold } from 'config/terminal';

interface Hash {
  [key: string]: string
}

export default function handleLab(term: StructureTerminal) {
  const mem = term.room.memory
  if (mem.labState !== IDLE) return NOTHING_DONE
  for (const r1 in term.store) {
    const resource1 = r1 as ResourceConstant
    if (term.store[resource1] < TERMINAL_MIN_SEND) continue
    if (!REACTIONS[resource1]) continue
    for (const r2 in term.store) {
      const resource2 = r2 as ResourceConstant
      if (r1 === r2) continue
      if (term.store[resource2] < TERMINAL_MIN_SEND) continue
      if (!REACTIONS[resource2]) continue
      const intersection = (REACTIONS[resource1] as Hash)[resource2] as ResourceConstant
      if (term.store[intersection] >= labProductionThreshold) continue
      mem.labState = LAB_PENDING
      mem.labRecipe = intersection
      mem.labIndegrient1 = resource1
      mem.labIndegrient2 = resource2
      mem.labTargetAmount = Math.floor(Math.min(term.store[resource1], term.store[resource2], LAB_MINERAL_CAPACITY) / LAB_REACTION_AMOUNT) * LAB_REACTION_AMOUNT
      return SUCCESS
    }
  }
  return DONE
}
