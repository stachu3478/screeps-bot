import { NOTHING_TODO, SUCCESS, DONE, FAILED, NO_RESOURCE } from 'constants/response'
import { storageSendThreshold } from 'config/terminal'

export default function sendExcess(terminal: StructureTerminal) {
  const room = terminal.room
  const resourceType = terminal.room.memory.terminalDealResourceType || RESOURCES_ALL.find(resource => room.store(resource) > storageSendThreshold && terminal.store[resource] > TERMINAL_MIN_SEND)
  if (!resourceType) return NOTHING_TODO
  let excessLocalAmount = room.store(resourceType) - storageSendThreshold
  const amountInTerminal = terminal.store[resourceType]
  if (Math.min(excessLocalAmount, amountInTerminal) <= TERMINAL_MIN_SEND) return NO_RESOURCE
  for (const name in Memory.myRooms) {
    const room = Game.rooms[name]
    if (!room) continue
    const roomTerminal = room.terminal
    if (!roomTerminal || !roomTerminal.my) continue
    const missing = storageSendThreshold - room.store(resourceType)
    if (missing < TERMINAL_MIN_SEND) continue
    const toSend = Math.min(missing, excessLocalAmount, amountInTerminal)
    const result = terminal.send(resourceType, toSend, name)
    if (result !== 0) return FAILED
    return SUCCESS
  }
  return DONE
}
