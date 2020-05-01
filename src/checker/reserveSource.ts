import plan from '../planner/core'

export function reserveSource(creep: Creep, source: Source) {
  if (creep.memory._sourceResevation) return creep.memory._sourceResevation
  const roomMem = creep.room.memory
  if (!roomMem.colonySources) plan(creep.room)
  let reserved = false
  const reservations = roomMem.colonySources && roomMem.colonySources[source.id] || []
  let reservedPos = ' '
  reservations.forEach((r, k) => {
    const reserver = Game.creeps[r.slice(1)]
    if (!reserved && (!reserver || reserver.memory._sourceResevation !== r[0])) {
      reserved = true
      reservations[k] = r[0] + creep.name
      reservedPos = r[0]
    }
  })
  if (!reserved) return false
  return creep.memory._sourceResevation = reservedPos
}

export function unReserveSource(creep: Creep) {
  if (!creep.memory._sourceResevation) return
  const roomMem = creep.room.memory
  const reservations = roomMem.colonySources && roomMem.colonySources[creep.memory._harvest || 0] || []
  const reservedPos = creep.memory._sourceResevation
  reservations.forEach((r, k) => {
    if (r[0] === reservedPos) reservations[k] = r[0]
  })
  delete creep.memory._sourceResevation
}
