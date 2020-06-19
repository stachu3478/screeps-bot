import drawContainer from "routine/haul/containerDraw";
import { ACCEPTABLE } from "constants/response";

export default function canUtilizeEnergy(creep: Creep) {
  const room = creep.room
  return !(room.filled
    && room.memory._built
    && room.memory.repaired
    && !room.memory._dismantle)
    || (drawContainer(creep) in ACCEPTABLE)
}
