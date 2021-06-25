import move, { isWalkable } from 'utils/path/path'

export interface MoveCreep extends Creep {
  cache: MoveCache
}

interface MoveCache extends CreepCache {
  name?: string
  noPathTimeout?: number
  nextStep?: PathStep
  nextPullerStep?: PathStep
}

function wipeCaches(creep: MoveCreep, target: Creep) {
  delete target.cache.moverPath
  delete creep.cache.name
  delete target.motherRoom.memory._moveNeeds
  delete creep.cache.noPathTimeout
  delete creep.cache.nextStep
  delete creep.cache.nextPullerStep
}

export default function moveCreep(
  creep: MoveCreep,
  targetCreep = Game.creeps[creep.cache.name || ''],
) {
  let target = targetCreep
  if (!target) {
    const creeps = creep.motherRoom.memory.creeps
    target =
      Game.creeps[
        (creeps &&
          Object.keys(creeps).find(
            (name) => !!Game.creeps[name].cache.moverPath,
          )) ||
          ''
      ]
    if (!target) {
      delete creep.motherRoom.memory._moveNeeds
      console.log('not raget')
      return false
    }
    creep.cache.name = target.name
  }

  let nextStep = creep.cache.nextStep
  if (!nextStep || target.pos.rangeXY(nextStep.x, nextStep.y) === 0) {
    let steps = target.cache.moverPath as PathStep[]
    nextStep = creep.cache.nextStep =
      creep.cache.nextPullerStep || steps.shift()
    creep.cache.nextPullerStep = steps.shift()
  }
  const nextPullerStep = creep.cache.nextPullerStep
  if (!nextStep) {
    wipeCaches(creep, target)
    console.log('epic fail')
    return false
  }
  // not working
  //const pathIsWalkable = !isWalkable(target.room, nextStep.x, nextStep.y, creep)
  const isNearPath = target.pos.rangeXY(nextStep.x, nextStep.y) === 1
  if (!isNearPath) {
    if ((creep.cache.noPathTimeout || 0) >= 5) {
      wipeCaches(creep, target)
      console.log('no path')
      return false
    } else {
      const targetRoom =
        target.pos.rangeXY(nextStep.x, nextStep.y) < 10
          ? target.room.name
          : creep.room.name
      console.log(
        'no path retry',
        nextStep.x,
        nextStep.y,
        targetRoom,
        isNearPath,
      )
      creep.cache.noPathTimeout = (creep.cache.noPathTimeout || 0) + 1
      creep.moveTo(new RoomPosition(nextStep.x, nextStep.y, targetRoom))
      return false
    }
  }

  if (creep.pos.isEqualTo(nextStep.x, nextStep.y)) {
    move.anywhere(
      creep,
      nextPullerStep ? nextPullerStep.direction : TOP,
      target,
    )
    creep.pull(target)
    target.move(creep)
    console.log('yay')
    delete creep.cache.noPathTimeout
  } else {
    console.log('lets go', nextStep.x, nextStep.y)
    creep.moveTo(new RoomPosition(nextStep.x, nextStep.y, target.room.name))
  }
  return true
}
