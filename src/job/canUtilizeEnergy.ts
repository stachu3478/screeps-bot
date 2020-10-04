import drawContainer from 'routine/haul/containerDraw'
import { ACCEPTABLE } from 'constants/response'

export default function canUtilizeEnergy(creep: Creep) {
  const room = creep.room
  const cache = room.cache
  return (
    !(
      room.filled &&
      cache.built &&
      cache.repaired &&
      !room.memory._dismantle
    ) || drawContainer(creep) in ACCEPTABLE
  )
}
