import drawContainer from 'routine/haul/containerDraw'
import { ACCEPTABLE } from 'constants/response'

export default function canUtilizeEnergy(creep: Creep) {
  const room = creep.room
  const cache = room.cache
  const result =
    !(
      room.filled &&
      cache.built &&
      cache.repaired &&
      !room.memory._dismantle
    ) &&
    (room.storage || drawContainer(creep) in ACCEPTABLE)
  return result
}
