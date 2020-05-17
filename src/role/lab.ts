import { IDLE, LAB_COOLDOWN, LAB_PENDING } from "constants/state";
import { infoStyle } from "room/style";

export default function lab(internal1: StructureLab, internal2: StructureLab, external: StructureLab[]) {
  const room = internal1.room
  const mem = room.memory
  switch (mem.terminalState) {
    case IDLE:
      room.visual.text('Labs: Idle', 0, 5, infoStyle)
      break;
    case LAB_COOLDOWN: {
      const cooldown = mem.labCooldown || 0
      if (cooldown === 0) {

      } else mem.labCooldown = cooldown - 1
    } break
    case LAB_PENDING: {

    } break
    default: mem.terminalState = IDLE
  }
}
