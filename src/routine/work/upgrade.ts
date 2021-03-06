import move from '../../utils/path/path'
import { SUCCESS, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'

export default function upgrade(creep: Creep, staticMode: boolean = false) {
  const storedEnergy = creep.store[RESOURCE_ENERGY]
  if (storedEnergy === 0) return NO_RESOURCE
  let target = creep.motherRoom.controller
  if (!target) return FAILED
  const result = creep.upgradeController(target)
  const remaining = storedEnergy - creep.corpus.count(WORK)
  if (result === ERR_NOT_IN_RANGE) move.cheap(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (!staticMode && creep.pos.rangeTo(target) > 2)
      move.cheap(creep, target, false, 2)
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
