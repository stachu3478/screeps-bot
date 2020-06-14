import { NOTHING_TODO, SUCCESS, DONE, FAILED, NO_RESOURCE } from "constants/response";
import { storageSendThreshold } from 'config/terminal'

export default function sendExcess(terminal: StructureTerminal) {
  const resourceType = terminal.room.memory.terminalDealResourceType || RESOURCES_ALL.find(resource => terminal.store[resource] > storageSendThreshold)
  if (!resourceType) return NOTHING_TODO
  let excessLocalAmount = terminal.store[resourceType] - storageSendThreshold
  if (excessLocalAmount <= TERMINAL_MIN_SEND) return NO_RESOURCE
  for (const name in Memory.myRooms) {
    const room = Game.rooms[name]
    if (!room) continue
    const roomTerminal = room.terminal
    if (!roomTerminal || !roomTerminal.my) continue
    const missing = storageSendThreshold - roomTerminal.store[resourceType]
    if (missing < TERMINAL_MIN_SEND) continue
    const toSend = Math.min(missing, excessLocalAmount)
    const result = terminal.send(resourceType, toSend, name)
    if (result !== 0) return FAILED
    return SUCCESS
  }
  return DONE
}
