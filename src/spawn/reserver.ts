import player from 'constants/player'
import _ from 'lodash'
import SpawnCreep from './spawnCreep'
import { ReserverMemory } from '../role/creep/military/reserver'

export default class SpawnReserver extends SpawnCreep {
  private missingRoom?: string
  protected allowWhenEnergyFull = true
  private claimParts = 0

  run() {
    if (!this.missingRoom) {
      throw new Error('Missing remote room for new creep to assign')
    }
    const memory: ReserverMemory = {
      role: this.role,
      room: this.room.name,
      deprivity: 0,
      reserve: this.missingRoom,
    }
    const body = new Array(this.claimParts)
      .fill(MOVE)
      .concat(new Array(this.claimParts).fill(CLAIM))
    this.spawn.trySpawnCreep(body, 'R', memory, false, 10)
  }

  needs() {
    if (super.needs()) {
      this.findMissingClaimRoom()
    }
    return !!this.missingRoom && !!this.claimParts
  }

  static success(name: string, body: BodyPartConstant[]) {
    const memory = Memory.creeps[name] as ReserverMemory
    const cost = _.sum(body, (type) => BODYPART_COST[type])
    Memory.rooms[memory.reserve].R = name
    Game.rooms[memory.room].remoteMiningMonitor.monit(-cost)
  }

  private findMissingClaimRoom() {
    const remoteMemory = this.spawn.room.memory.r || []
    remoteMemory.every((lookup) => {
      const position = RoomPosition.from(lookup)
      const miningRoomMemory = Memory.rooms[position.roomName]
      return this.isValidReservationState(
        miningRoomMemory?.R || '',
        position.roomName,
      )
    })
  }

  private isValidReservationState(creepName: string, targetRoom: string) {
    const creep = Game.creeps[creepName]
    if (creep) {
      return true
    }
    const room = Game.rooms[targetRoom]
    if (!room) {
      return true
    }
    const controller = room.controller
    if (!controller) {
      return true
    }
    const pathRoom = this.room.pathScanner.rooms[targetRoom]
    if (!pathRoom) {
      return true
    }
    let reservationTicks = 0
    const reservation = controller.reservation
    if (reservation) {
      if (reservation.username === player) {
        reservationTicks = reservation.ticksToEnd
      } else {
        reservationTicks = -reservation.ticksToEnd
      }
    }
    const ticksAtArrive =
      reservationTicks - pathRoom.cost - CREEP_SPAWN_TIME * 2
    if (ticksAtArrive > 0) {
      return true
    }
    console.log(
      'need to reserve',
      targetRoom,
      ticksAtArrive,
      reservationTicks,
      pathRoom.cost,
    )
    const optimalClaimParts = Math.floor(
      (CONTROLLER_RESERVE_MAX - ticksAtArrive) /
        (CREEP_CLAIM_LIFE_TIME - pathRoom.cost) +
        1,
    )
    const energyClaimPartLimit = Math.floor(
      this.room.energyCapacityAvailable /
        (BODYPART_COST[MOVE] + BODYPART_COST[CLAIM]),
    )
    this.claimParts = Math.min(optimalClaimParts, energyClaimPartLimit)
    this.missingRoom = targetRoom
    return this.claimParts === 0
  }

  get role(): Role.RESERVER {
    return Role.RESERVER
  }
}
