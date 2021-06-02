import _ from 'lodash'
import range from 'utils/range'

export default class DepositPlanner {
  private info?: RoomNeighbourPath

  constructor(info?: RoomNeighbourPath) {
    this.info = info
  }

  get deposit() {
    const miningRoomInfo = this.info
    if (!miningRoomInfo || !miningRoomInfo.deposits.length) {
      return
    }
    return _.min(miningRoomInfo.deposits, (d) => d.lastCooldown)
  }

  get cost() {
    const deposit = this.deposit
    if (!deposit || !this.info) {
      return 0
    }
    return (
      this.info.cost + range(deposit.x + this.info.x, deposit.y + this.info.y)
    )
  }

  get coverage() {
    const deposit = this.deposit
    if (!deposit || !this.info) {
      return 0
    }
    return deposit.coverage
  }

  get lastCooldown() {
    const deposit = this.deposit
    if (!deposit || !this.info) {
      return 0
    }
    return deposit.lastCooldown
  }

  get room() {
    return this.info?.name
  }
}
