interface ReactionTimeHash {
  [key: string]: number
}

export default function lab(room: Room) {
  const mem = room.memory
  const cache = room.cache
  const cooldown = cache.labCooldown || 0
  if (cooldown > 0) {
    cache.labCooldown = cooldown - 1
    return
  }

  const lab1 = room.lab1
  const lab2 = room.lab2
  if (!lab1 || !lab2) return
  switch (mem.labState) {
    case State.IDLE:
      room.visual.info('Labs: Idle', 0, 5)
      if (lab1.mineralType || lab2.mineralType)
        mem.labState = State.LAB_COLLECTING
      break
    case State.LAB_COLLECTING:
      room.visual.info('Labs: Collecting resources...', 0, 5)
      break
    case State.LAB_PRODUCING:
      const recipe = mem.labRecipe
      if (!recipe) {
        mem.labState = State.LAB_COLLECTING
        room.visual.info('Labs: Recipe not found!', 0, 5)
        break
      }
      const labs = room.externalLabs
      let result
      labs.forEach((lab, i) => {
        if (lab.shouldRunReaction(recipe, i))
          result = lab.runReaction(lab1, lab2)
      })
      if (result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_FULL) {
        delete mem.labRecipe
        mem.labState = State.LAB_COLLECTING
        room.visual.info('Labs: Insufficient minerals!', 0, 5)
        break
      }
      room.visual.info('Labs: Running reaction: ' + recipe, 0, 5)
      cache.labCooldown = (REACTION_TIME as ReactionTimeHash)[recipe] - 1
      break
    case State.LAB_PENDING:
      room.visual.info('Labs: Waiting for creeps', 0, 5)
      if (!mem.labRecipe) {
        mem.labState = State.LAB_COLLECTING
        break
      }
      if (lab1.mineralType && lab1.mineralType !== mem.labIndegrient1)
        mem.labState = State.LAB_COLLECTING
      if (lab2.mineralType && lab2.mineralType !== mem.labIndegrient2)
        mem.labState = State.LAB_COLLECTING
      break
    default:
      room.visual.info('Labs: Unknown state: ' + mem.labState, 0, 5)
      if (mem.labRecipe) mem.labState = State.LAB_PRODUCING
      else mem.labState = State.IDLE
  }
}
