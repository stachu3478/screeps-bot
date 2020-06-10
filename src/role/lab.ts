import { IDLE, LAB_PRODUCING, LAB_PENDING, LAB_COLLECTING } from "constants/state";
import { infoStyle } from "room/style";

interface ReactionTimeHash {
  [key: string]: number
}

export default function lab(room: Room) {
  const mem = room.memory
  const cooldown = mem.labCooldown || 0
  if (cooldown > 0) {
    mem.labCooldown = cooldown - 1
    return
  }

  const lab1 = room.lab1
  const lab2 = room.lab2
  if (!lab1 || !lab2) return
  switch (mem.labState) {
    case IDLE:
      room.visual.text('Labs: Idle', 0, 5, infoStyle)
      if (lab1.mineralType || lab2.mineralType) mem.labState = LAB_COLLECTING
      break;
    case LAB_COLLECTING:
      room.visual.text('Labs: Collecting resources...', 0, 5, infoStyle)
      break;
    case LAB_PRODUCING:
      if (!mem.labRecipe) {
        mem.labState = LAB_COLLECTING
        room.visual.text('Labs: Recipe not found!', 0, 5, infoStyle)
        break
      }
      const labs = room.externalLabs
      let result
      labs.forEach(lab => {
        result = lab.runReaction(lab1, lab2)
      })
      if (result === ERR_NOT_ENOUGH_RESOURCES || result === ERR_FULL) {
        delete mem.labRecipe
        mem.labState = LAB_COLLECTING
        room.visual.text('Labs: Insufficient minerals!', 0, 5, infoStyle)
        break
      }
      room.visual.text('Labs: Running reaction: ' + mem.labRecipe, 0, 5, infoStyle)
      mem.labCooldown = (REACTION_TIME as ReactionTimeHash)[mem.labRecipe] - 1
      break
    case LAB_PENDING:
      room.visual.text('Labs: Waiting for creeps', 0, 5, infoStyle)
      if (!mem.labRecipe) {
        mem.labState = LAB_COLLECTING
        break
      }
      if (lab1.mineralType && lab1.mineralType !== mem.labIndegrient1) mem.labState = LAB_COLLECTING
      if (lab2.mineralType && lab2.mineralType !== mem.labIndegrient2) mem.labState = LAB_COLLECTING
      break
    default:
      room.visual.text('Labs: Unknown state: ' + mem.labState, 0, 5, infoStyle)
      if (mem.labRecipe) mem.labState = LAB_PRODUCING
      else mem.labState = IDLE
  }
}
