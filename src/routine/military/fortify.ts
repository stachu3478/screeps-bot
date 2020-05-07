import _ from 'lodash'
import { DONE, SUCCESS, FAILED, NOTHING_DONE } from "constants/response";

export default function fortify(creep: Creep) {
  const repairTarget = Game.getObjectById(creep.memory._repair || ('' as Id<Structure>))
  if (repairTarget && repairTarget.structureType === STRUCTURE_RAMPART) {
    creep.say("Fort")
    return DONE
  }
  const buildTarget = Game.getObjectById(creep.memory._build || ('' as Id<ConstructionSite>))
  if (buildTarget && buildTarget.structureType === STRUCTURE_RAMPART) {
    creep.say("nite")
    return DONE
  }

  const ramp = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType === STRUCTURE_RAMPART)[0]
  if (ramp) {
    creep.memory._repair = ramp.id
    creep.say("rtni")
    return SUCCESS
  }

  const rampSite = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0]
  if (!rampSite) {
    creep.say("ort")
    if (creep.pos.createConstructionSite(STRUCTURE_RAMPART) === 0) return NOTHING_DONE
    else return FAILED
  }
  creep.memory._build = rampSite.id
  creep.say("tnt")
  return SUCCESS
}
