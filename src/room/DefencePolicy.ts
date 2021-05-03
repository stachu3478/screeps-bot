export default class DefencePolicy {
  private memory: RoomMemory
  private holdingTicks: number
  private holdingTimer: number

  constructor(room: Room) {
    this.memory = room.memory
    this.holdingTicks =
      this.memory[RoomMemoryKeys.defenceHoldingTicks] ||
      (this.memory[RoomMemoryKeys.defenceHoldingTicks] = 0)
    this.holdingTimer =
      this.memory[RoomMemoryKeys.defenceHoldingTimer] ||
      (this.memory[RoomMemoryKeys.defenceHoldingTimer] = 0)
  }

  shouldAttack(thresholdAlly: boolean) {
    if (thresholdAlly) {
      this.setHoldingTimer(this.holdingTimer - 1)
      if (this.holdingTimer + this.holdingTicks < 0) return true
    } else {
      this.setHoldingTicks(Math.max(this.holdingTicks, -this.holdingTimer))
      this.setHoldingTimer(this.holdingTicks)
    }
    return false
  }

  reset() {
    this.setHoldingTicks(0)
    this.setHoldingTimer(0)
  }

  private setHoldingTimer(v: number) {
    this.holdingTimer = this.memory[RoomMemoryKeys.defenceHoldingTimer] = v
  }

  private setHoldingTicks(v: number) {
    this.holdingTicks = this.memory[RoomMemoryKeys.defenceHoldingTicks] = v
  }
}
