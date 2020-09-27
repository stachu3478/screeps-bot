import drawStorage from 'routine/haul/storageDraw'
import drawContainer from 'routine/haul/containerDraw'
import { ACCEPTABLE } from 'constants/response'
import Harvester from 'role/creep/harvester.d'

export default function energyHaul(creep: Harvester) {
  if (drawStorage(creep) in ACCEPTABLE) creep.memory.state = State.STORAGE_DRAW
  else if (drawContainer(creep) in ACCEPTABLE)
    creep.memory.state = State.HARVESTING
  else if (creep.room.memory._dismantle) {
    creep.memory._arrive = creep.room.memory._dismantle
    creep.memory.state = State.ARRIVE_HOSTILE
  }
}
