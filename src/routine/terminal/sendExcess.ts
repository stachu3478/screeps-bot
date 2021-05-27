import {
  NOTHING_TODO,
  SUCCESS,
  DONE,
  FAILED,
  NO_RESOURCE,
} from 'constants/response'
import { storageSendThreshold } from 'config/terminal'
import MyRooms from 'room/MyRooms'

export default function sendExcess(
  terminal: StructureTerminal,
  myRooms = MyRooms,
) {
  const room = terminal.room
  const resourceType =
    terminal.cache.dealResourceType ||
    RESOURCES_ALL.find(
      (resource) =>
        room.store(resource) > storageSendThreshold &&
        terminal.store[resource] > TERMINAL_MIN_SEND,
    )
  if (!resourceType) return NOTHING_TODO
  let excessLocalAmount = room.store(resourceType) - storageSendThreshold
  const amountInTerminal = terminal.store[resourceType]
  if (Math.min(excessLocalAmount, amountInTerminal) <= TERMINAL_MIN_SEND)
    return NO_RESOURCE
  let result = 1
  const sentExcess = myRooms.get().some((room) => {
    const roomTerminal = room.terminal
    if (!roomTerminal || !roomTerminal.my) return false
    const missing = storageSendThreshold - room.store(resourceType)
    if (missing < TERMINAL_MIN_SEND) return false
    const toSend = Math.min(missing, excessLocalAmount, amountInTerminal)
    result = terminal.send(resourceType, toSend, room.name)
    return true
  })
  if (!sentExcess) return DONE
  if (result !== 0) return FAILED
  return SUCCESS
}
