import { DONE, FAILED, NOTHING_DONE } from 'constants/response'
import { findHaulable } from 'utils/find'
import scorePlanner from 'planner/score'

interface ScoutCreep extends Creep {
  memory: ScoutMemory
}

interface ScoutMemory extends CreepMemory {}

class ClaimChecker {
  private controller?: StructureController
  private creep: Creep
  claimable: boolean
  checkable: boolean
  constructor(creep: Creep) {
    this.creep = creep
    this.controller = creep.room.controller
    this.checkable = false
    this.claimable = false
  }

  fetchClaimable() {
    this.checkable = true
    const controller = this.controller
    if (
      !controller ||
      controller.my ||
      controller.owner ||
      controller.reservation
    )
      return (this.claimable = false)

    const sources = this.creep.room.find(FIND_SOURCES)
    if (sources.length < 2) return (this.claimable = false)

    const move = this.creep.moveTo(controller)
    if (move === 0) return (this.claimable = true)
    if (move === ERR_NO_PATH) return (this.claimable = false)
    return (this.checkable = false)
  }
}

export function requestHaul(creep: ScoutCreep) {
  const roomMemory = creep.motherRoom.memory
  if (roomMemory._haul && roomMemory._haulScore && !creep.room.my) return
  const haulable = findHaulable(creep.room, creep.pos)
  if (!haulable) return
  if (creep.moveTo(haulable) === ERR_NO_PATH) return
  roomMemory._haul = creep.room.name
  roomMemory._haulScore = creep.room.find(10011 as FindConstant) ? 1 : 0
}

export default function scout(creep: ScoutCreep) {
  if (scorePlanner(creep.room, creep.motherRoom.memory)) {
    console.log('Room score plan found')
  }
  requestHaul(creep)
  const claimChecker = new ClaimChecker(creep)
  claimChecker.fetchClaimable()
  if (!claimChecker.checkable) return NOTHING_DONE
  if (claimChecker.claimable) return DONE
  return FAILED
}
