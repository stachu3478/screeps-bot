import remoteMining from 'config/remoteMining'
import player from 'constants/player'
import { INVADER_USERNAME } from 'constants/support'

export default class RemoteMiningValidator {
  private roomName: string
  private inspectorRoom: Room

  constructor(roomName: string, inspectorRoom: Room) {
    this.roomName = roomName
    this.inspectorRoom = inspectorRoom
  }

  validateRoom() {
    if (!this.validateRoomPath()) {
      return false
    }
    const room = Game.rooms[this.roomName]
    if (!room) {
      return true
    }
    return (
      this.noPotencialHostileMiningCreeps(room) &&
      this.validateController(room.controller)
    )
  }

  private validateRoomPath() {
    const roomPath = this.inspectorRoom.pathScanner.rooms[this.roomName]
    return (
      !roomPath ||
      (roomPath.safe && roomPath.cost <= remoteMining.sources.maxCost)
    )
  }

  private noPotencialHostileMiningCreeps(room: Room) {
    const sources = room.find(FIND_SOURCES)
    const hostiles = room.find(FIND_HOSTILE_CREEPS)
    return !hostiles.some(
      (h) => h.corpus.count(WORK) && sources.some((s) => h.pos.isNearTo(s)),
    )
  }

  private validateController(controller?: StructureController) {
    if (!controller) {
      return true
    }
    if (controller.owner?.username) {
      return false
    }
    return this.validateReservation(controller.reservation)
  }

  private validateReservation(reservation?: ReservationDefinition) {
    if (!reservation) {
      return true
    }
    return (
      reservation.username === player ||
      reservation.username === INVADER_USERNAME
    )
  }
}
