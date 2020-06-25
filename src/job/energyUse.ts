import Harvester from "role/creep/harvester.d";
import { ACCEPTABLE, NO_RESOURCE, NOTHING_TODO } from "constants/response";
import State from "constants/state";
import place from "planner/place/place";
import build from "routine/work/build";
import repair from "routine/work/repair";
import fillStorage from "routine/haul/storageFill";
import priorityFill from "routine/haul/priorityFill";
import { energyToBuildThreshold } from "config/storage";

const shouldBuild = (room: Room) => !room.storage || room.store(RESOURCE_ENERGY) > energyToBuildThreshold
export default function energyUse(creep: Harvester) {
  let result
  creep.memory._noJob = 0
  const motherRoom = creep.motherRoom
  if ((result = priorityFill(creep)) in ACCEPTABLE) creep.memory.state = State.FILL_PRIORITY
  else if ((result = repair(creep)) in ACCEPTABLE) creep.memory.state = State.REPAIR
  else if (shouldBuild(motherRoom) && (build(creep) !== NOTHING_TODO || place(motherRoom) in ACCEPTABLE)) creep.memory.state = State.BUILD
  else if (motherRoom.memory._dismantle) {
    creep.memory._arrive = motherRoom.memory._dismantle
    creep.memory.state = State.ARRIVE_HOSTILE
  } else if (result === NO_RESOURCE) {

  } else {
    if ((result = fillStorage(creep)) in ACCEPTABLE) creep.memory.state = State.STORAGE_FILL
    creep.memory._noJob = 1
    if (result === NO_RESOURCE) creep.memory.state = State.IDLE
  }
}
