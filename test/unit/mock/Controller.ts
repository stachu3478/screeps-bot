export default class ControllerMock {
  public level: number
  public progress: number
  public progressTotal: number
  public safeModeAvailable: number
  public sign: SignDefinition | undefined
  public ticksToDowngrade: number
  public upgradeBlocked: number
  public reservation: any
  public isPowerEnabled: boolean

  constructor() {
    this.level = 0
    this.progress = 0
    this.progressTotal = Infinity
    this.safeModeAvailable = 0
    this.ticksToDowngrade = Infinity
    this.upgradeBlocked = 0
    this.isPowerEnabled = false
  }
}
