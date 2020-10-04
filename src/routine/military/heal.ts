import { SUCCESS, NOTHING_DONE } from 'constants/response'
import { findClosestDamagedCreeps } from 'utils/find'

export default function heal(creep: Creep) {
  const nearest = findClosestDamagedCreeps(creep.pos)
  if (nearest) {
    let result
    if (creep.pos.isNearTo(nearest)) {
      result = creep.heal(nearest)
    }
    result = creep.rangedHeal(nearest)
    if (result === 0) return SUCCESS
  } else creep.heal(creep)
  return NOTHING_DONE
}
