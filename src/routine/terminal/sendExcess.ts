import { NOTHING_TODO, SUCCESS, DONE, FAILED, NO_RESOURCE } from "constants/response";
import { storagePerResource } from "utils/handleTerminal";

export default function sendExcess(terminal: StructureTerminal) {
  const resourceType = terminal.room.memory.terminalDealResourceType
  if (!resourceType) return NOTHING_TODO
  let excessLocalAmount = terminal.store[resourceType] - storagePerResource * 3
  if (excessLocalAmount <= TERMINAL_MIN_SEND) return NO_RESOURCE
  for (const name in Memory.myRooms) {
    const room = Game.rooms[name]
    if (!room) continue
    const roomTerminal = room.terminal
    if (!roomTerminal || !roomTerminal.my) continue
    const missing = storagePerResource - roomTerminal.store[resourceType]
    console.log(missing)
    if (missing < TERMINAL_MIN_SEND) continue
    const toSend = Math.min(missing, excessLocalAmount)
    const result = terminal.send(resourceType, toSend, name)
    if (result !== 0) return FAILED
    return SUCCESS
  }
  return DONE
}
