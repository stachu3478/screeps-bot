import { isWalkable } from 'utils/path'

export default class QuadSquadHandler {
  private creeps: string[]
  private active: boolean
  private assembled: boolean
  private targetRoom: string
  private path?: PathStep[]

  constructor(targetRoom: string) {
    this.creeps = []
    this.active = true
    this.assembled = false
    this.targetRoom = targetRoom
  }

  loop() {
    if (!this.assembled || !this.isWhole()) return
    if (!this.path) {
      const pos = new RoomPosition(25, 25, this.targetRoom)
      const creep = Game.creeps[this.creeps[0]]
      this.path = creep.room.findPath(creep.pos, pos, { range: 25 })
    }
    const targetPos = this.path[0]
    if (!targetPos) return
    if (this.creepPositionsMatch(targetPos)) this.path.shift()
  }

  addCreep(creep: Creep) {
    this.creeps.push(creep.name)
    if (this.creeps.length === 4) this.assembled = true
  }

  isAssembled() {
    return this.assembled
  }

  isActive() {
    return this.active
  }

  private creepPositionsMatch(targetPos: PathStep) {
    return this.creeps.every((name, i) => {
      const creep = Game.creeps[name]
      const pos = creep.pos
      const [x, y] = [targetPos.x + (i % 2), targetPos.y + Math.floor(i / 2)]
      const shouldMove =
        (x !== pos.x || y !== pos.y) && isWalkable(creep.room, x, y)
      if (shouldMove) creep.moveTo(x, y)
      return !shouldMove
    })
  }

  private isWhole() {
    const whole = this.creeps.every((name) => !!Game.creeps[name])
    if (this.assembled && !whole) this.active = false
    return whole
  }
}
