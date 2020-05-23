import drawStorage from "routine/haul/storageDraw";
import drawContainer from "routine/haul/containerDraw";
import { ACCEPTABLE } from "constants/response";
import { STORAGE_DRAW, HARVESTING, ARRIVE_HOSTILE } from "constants/state";
import { LAB_MANAGER } from "constants/role";
import Harvester from "role/harvester.d";

export default function energyHaul(creep: Harvester) {
  if (!creep.memory._noJob && drawStorage(creep) in ACCEPTABLE) creep.memory.state = STORAGE_DRAW
  else if (drawContainer(creep) in ACCEPTABLE) creep.memory.state = HARVESTING
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = ARRIVE_HOSTILE
  } else if (creep.memory._noJob) {
    creep.memory._noJob = 0
    creep.memory.role = LAB_MANAGER
  }
}
