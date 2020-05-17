import _ from 'lodash'
import { IDLE, LAB_PENDING } from 'constants/state';
import { storagePerResource } from './handleTerminal';
import { DONE, SUCCESS, NOTHING_DONE } from 'constants/response';

export default function handleLab(term: StructureTerminal) {
  const mem = term.room.memory
  if (mem.labState !== IDLE) return NOTHING_DONE
  for (let r1 in term.store) {
    const resource1 = r1 as ResourceConstant
    if (term.store[resource1] < TERMINAL_MIN_SEND) continue
    if (!REACTIONS[resource1]) continue
    for (let r2 in term.store) {
      const resource2 = r2 as ResourceConstant
      if (r1 === r2) continue
      if (term.store[resource2] < TERMINAL_MIN_SEND) continue
      if (!REACTIONS[resource2]) continue
      const intersection = Object.keys(_.pick(REACTIONS[resource1], Object.keys(REACTIONS[resource2])))
      let done = false
      intersection.forEach((r) => {
        if (done) return
        const resource = r as ResourceConstant
        if (term.store[resource] >= storagePerResource) return
        done = true
        mem.labState = LAB_PENDING
        mem.labRecipe = resource
        mem.labIndegrient1 = resource1
        mem.labIndegrient2 = resource2
        mem.labTargetAmount = Math.floor(Math.min(term.store[resource1], term.store[resource2], LAB_MINERAL_CAPACITY) / LAB_REACTION_AMOUNT) * LAB_REACTION_AMOUNT
      })
      if (done) return SUCCESS
    }
  }
  return DONE
}
