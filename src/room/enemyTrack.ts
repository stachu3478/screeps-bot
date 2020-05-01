function rankCreep(creep: Creep) {
  return (creep.getActiveBodyparts(HEAL) << 10)
    + (creep.getActiveBodyparts(CLAIM) << 10)
    + (creep.getActiveBodyparts(RANGED_ATTACK) << 7)
    + (creep.getActiveBodyparts(ATTACK) << 5)
    + (creep.getActiveBodyparts(WORK) << 3)
}

export default function trackEnemy(room: Room) {
  return room.find(FIND_HOSTILE_CREEPS, {
    filter: (creep) => {
      return creep.getActiveBodyparts(ATTACK) > 0
        || creep.getActiveBodyparts(WORK) > 0
        || creep.getActiveBodyparts(RANGED_ATTACK) > 0
        || creep.getActiveBodyparts(CLAIM) > 0
        || creep.getActiveBodyparts(HEAL) > 0
    }
  }).sort((a, b) => rankCreep(b) - rankCreep(a))[0]
}
