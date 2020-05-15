import { IDLE, TERM_SEND_EXCESS, TERM_SELL_EXCESS, TERM_BUSINESS } from "constants/state";
import sendExcess from "routine/terminal/sendExcess";
import { DONE, NOTHING_TODO, NO_RESOURCE, FAILED, SUCCESS, NOTHING_DONE } from "constants/response";
import sellExcess from "routine/terminal/sellExcess";
import makeBusiness from "routine/terminal/makeBusiness";
import { infoStyle } from "room/style";

export default function terminal(term: StructureTerminal) {
  if (term.cooldown) return
  const mem = term.room.memory
  switch (mem.terminalState) {
    case IDLE:
      term.room.visual.text('Terminal: Idle', 0, 4, infoStyle)
      break;
    case TERM_SEND_EXCESS: {
      term.room.visual.text('Terminal: Sending excess resources.', 0, 4, infoStyle)
      switch (sendExcess(term)) {
        case NO_RESOURCE: case NOTHING_TODO: mem.terminalState = TERM_BUSINESS; break
        case DONE: case FAILED: mem.terminalState = TERM_SELL_EXCESS; break
      }
    } break
    case TERM_SELL_EXCESS: {
      term.room.visual.text('Terminal: Selling excess resources.', 0, 4, infoStyle)
      switch (sellExcess(term)) {
        case SUCCESS: break
        default: mem.terminalState = TERM_BUSINESS
      }
    } break
    case TERM_BUSINESS: {
      switch (makeBusiness(term)) {
        case DONE: {
          mem.terminalResourceIteration = 0
          mem.terminalState = IDLE
        } break
        case SUCCESS: console.log('Hooray!'); break
        case NOTHING_DONE: term.room.visual.text('Terminal: Looking for occasions: ' + RESOURCES_ALL[mem.terminalResourceIteration || -1], 0, 4, infoStyle)
      }
    } break
    default: mem.terminalState = TERM_BUSINESS
  }
}
