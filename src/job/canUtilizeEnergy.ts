export default function canUtilizeEnergy(creep: Creep) {
  const room = creep.room
  return !(room.filled
    && room.memory._built
    && room.memory.repaired
    && room.memory._dismantle)
}
