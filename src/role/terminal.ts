import sendExcess from 'routine/terminal/sendExcess'
import {
  DONE,
  NOTHING_TODO,
  NO_RESOURCE,
  FAILED,
  SUCCESS,
  NOTHING_DONE,
} from 'constants/response'
import sellExcess from 'routine/terminal/sellExcess'
import makeBusiness from 'routine/terminal/makeBusiness'
import { infoStyle } from 'room/style'
import buyMissing from 'routine/terminal/buyMissing'

export default function terminal(term: StructureTerminal) {
  if (term.cooldown) return
  const cache = term.cache
  switch (cache.state) {
    case State.IDLE:
      term.room.visual.text('Terminal: Idle', 0, 4, infoStyle)
      break
    case State.TERM_SEND_EXCESS:
      term.room.visual.text(
        'Terminal: Sending excess resources.',
        0,
        4,
        infoStyle,
      )
      switch (sendExcess(term)) {
        case NO_RESOURCE:
        case NOTHING_TODO:
          cache.state = State.TERM_BUSINESS
          break
        case DONE:
        case FAILED:
          cache.state = State.TERM_SELL_EXCESS
          break
      }
      break
    case State.TERM_SELL_EXCESS:
      term.room.visual.text(
        'Terminal: Selling excess resources.',
        0,
        4,
        infoStyle,
      )
      switch (sellExcess(term)) {
        case SUCCESS:
          break
        default:
          cache.state = State.TERM_BUY_MISSING
      }
      break
    case State.TERM_BUY_MISSING:
      term.room.visual.text(
        'Terminal: Buying missing resources.',
        0,
        4,
        infoStyle,
      )
      switch (buyMissing(term)) {
        case SUCCESS:
          break
        default:
          cache.state = State.TERM_BUSINESS
      }
      break
    case State.TERM_BUSINESS:
      switch (makeBusiness(term)) {
        case DONE:
          cache.resourceIteration = 0
          cache.state = State.IDLE
          break
        case SUCCESS:
          console.log('Hooray!')
          break
        case NOTHING_DONE:
          term.room.visual.text(
            'Terminal: Looking for occasions: ' +
              RESOURCES_ALL[cache.resourceIteration || -1],
            0,
            4,
            infoStyle,
          )
      }
      break
    default:
      cache.state = State.TERM_BUSINESS
  }
}
