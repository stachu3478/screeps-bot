import drawStorage from "routine/haul/storageDraw";
import drawContainer from "routine/haul/containerDraw";
import { ACCEPTABLE } from "constants/response";
import State from "constants/state";
import { LAB_MANAGER } from "constants/role";
import Harvester from "role/creep/harvester.d";

export default function energyHaul(creep: Harvester) {
  if (!creep.memory._noJob && drawStorage(creep) in ACCEPTABLE) creep.memory.state = State.STORAGE_DRAW
  else if (drawContainer(creep) in ACCEPTABLE) creep.memory.state = State.HARVESTING
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = State.ARRIVE_HOSTILE
  } else if (creep.memory._noJob) {
    creep.memory._noJob = 0
    if (creep.store.getUsedCapacity() > 0) creep.memory.state = State.STORAGE_FILL
    else creep.memory.role = LAB_MANAGER
  }
}
