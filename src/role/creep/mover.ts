import moveCreep from 'routine/move'

export default function mover(creep: Creep) {
  if (creep.motherRoom.memory._moveNeeds) moveCreep(creep)
}
