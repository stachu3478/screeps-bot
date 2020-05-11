import { DONE, FAILED, NOTHING_DONE } from 'constants/response';

interface ScoutCreep extends Creep {
  memory: ScoutMemory
}

interface ScoutMemory extends CreepMemory { }

export default function scout(creep: ScoutCreep) {
  const controller = creep.room.controller
  if (!controller || controller.my || controller.owner || controller.reservation) return FAILED

  const sources = creep.room.find(FIND_SOURCES)
  if (sources.length < 2) return FAILED

  const move = creep.moveTo(controller)
  if (move === 0) return DONE
  if (move === ERR_NO_PATH) return FAILED
  return NOTHING_DONE
}
