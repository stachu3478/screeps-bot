declare class DefencePolicy {
  constructor(room: Room)

  shouldAttack(thresholdAlly: boolean): boolean
  reset(): void
}
