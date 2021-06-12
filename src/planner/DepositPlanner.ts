import _ from 'lodash'
import range from 'utils/range'
import Game from '../../test/unit/mock/Game'
import DepositValidator from './DepositValidator'

export default class DepositPlanner {
  private info?: RoomNeighbourPath
  private depositToMine?: DepositTraits
  private currentCost?: number
  private sourceRoom: Room

  constructor(room: Room) {
    this.sourceRoom = room
    this.info = room.pathScanner.rooms[room.memory.mineDeposit || '']
    if (this.info && this.info.deposits.length) {
      this.depositToMine = _.min(this.info.deposits, (d) => d.lastCooldown)
      if (new DepositValidator().validate(this.depositToMine, this.info)) {
        this.currentCost = this.getDepositDistance(
          this.depositToMine,
          this.info,
        )
      } else {
        delete this.depositToMine
        delete room.memory.mineDeposit
        this.findNewDeposit()
      }
    } else if (!(Game.time % 1000)) {
      this.findNewDeposit()
    }
  }

  private findNewDeposit() {
    const validator = new DepositValidator()
    const rooms = this.pathScanner.rooms
    _.find(rooms, (room) => {
      if (!room) {
        return false
      }
      return room.deposits.find((traits) => {
        const result = validator.validate(traits, room)
        if (result) {
          this.info = room
          this.sourceRoom.memory.mineDeposit = room.name
          this.depositToMine = traits
          this.currentCost = this.getDepositDistance(traits, room)
        }
        return result
      })
    })
  }

  private getDepositDistance(
    traits: DepositTraits,
    pathRoom: RoomNeighbourPath,
  ) {
    return pathRoom.cost + range(traits.x + pathRoom.x, traits.y + pathRoom.y)
  }

  get deposit() {
    return this.depositToMine
  }

  get cost() {
    return this.currentCost || Infinity
  }

  get coverage() {
    return this.depositToMine?.coverage || 0
  }

  get lastCooldown() {
    return this.depositToMine?.lastCooldown || Infinity
  }

  get pathScanner() {
    return this.sourceRoom.pathScanner
  }

  get room() {
    return this.info?.name
  }
}
