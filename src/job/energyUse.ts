import Harvester from "role/harvester.d";
import fillTower from "routine/haul/towerFill";
import { ACCEPTABLE, NO_RESOURCE } from "constants/response";
import { TOWER_FILL, SPAWN_FILL, REPAIR, ARRIVE_HOSTILE, IDLE, STORAGE_FILL, BUILD } from "constants/state";
import place from "planner/place/place";
import build from "routine/work/build";
import repair from "routine/work/repair";
import fillSpawn from "routine/haul/spawnerFill";
import fillStorage from "routine/haul/storageFill";

export default function energyUse(creep: Harvester) {
  let result
  creep.memory._noJob = 0
  if ((result = fillTower(creep)) in ACCEPTABLE) creep.memory.state = TOWER_FILL
  else if ((result = fillSpawn(creep)) in ACCEPTABLE) creep.memory.state = SPAWN_FILL
  else if ((result = repair(creep)) in ACCEPTABLE) creep.memory.state = REPAIR
  else if ((result = build(creep)) in ACCEPTABLE || place(creep.room) in ACCEPTABLE) creep.memory.state = BUILD
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = ARRIVE_HOSTILE
  } else {
    if ((result = fillStorage(creep)) in ACCEPTABLE) creep.memory.state = STORAGE_FILL
    creep.memory._noJob = 1
    if (result === NO_RESOURCE) creep.memory.state = IDLE
  }
}
