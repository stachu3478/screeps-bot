import _ from 'lodash'
import Duet from 'role/creep/military/Duet'
import HitCalculator from 'room/military/HitCalculator'
import { findTarget, findTargetStructure } from 'routine/military/shared'
import Memoized from 'utils/Memoized'

const directions: DirectionConstant[] = [1, 2, 3, 4, 5, 6, 7, 8]
export default class DuetHandler {
  private room: Room
  private duet?: Duet
  private target: Memoized<Structure>

  constructor(room: Room) {
    this.room = room
    this.target = new Memoized()
    this.recover()
  }

  handle() {
    const duet = this.findOrCreateDuet()
    if (!duet) return
    duet.autoHeal()
    const safe = duet.safe
    if (safe && Game.cpu.bucket < 100) return
    if (!duet.whole || !duet.valid) return this.safeDestroyDuet(duet)
    if (!duet.connected) return duet.connect()
    const room = duet.room
    const pos = duet.pos
    if (!pos) return
    if (!safe || !duet.safetyHealed) {
      if (!safe) console.log('unsafe')
      else console.log('unhealed')
      if (
        !duet.fullHealed &&
        (duet.keeper?.room.name !== duet.protector?.room.name || duet.atBorder)
      ) {
        console.log('tragical')
        return duet.moveTo({ pos: this.room.sources.colonyPosition })
      }
      const calc = new HitCalculator(room)
      calc.fetch(false)
      const dealers = room.findHostileCreeps()
      const saferDir = _.min(directions, (d) => {
        const newPos = pos.offset(d)
        if (!newPos.isWalkable) return Infinity
        return calc.getDamage(newPos, dealers)
      })
      duet.move(saferDir)
    } else if (pos.roomName !== this.targetRoom) {
      console.log('unarrived')
      if (!this.targetRoom) return this.safeDestroyDuet(duet)
      duet.arrive(this.targetRoom)
    } else {
      console.log('attacking')
      let target = this.target.object
      if (!target) {
        target = findTargetStructure(duet.validCreeps[0])
        if (!target) {
          // delete this.room.memory[RoomMemoryKeys.ekhaust]
          console.log(
            'deleting blocked until fake reason will be removed',
            target,
            duet.pos,
          )
          return this.safeDestroyDuet(duet)
        }
        this.target = new Memoized(target)
      }
      const calc = new HitCalculator(room)
      calc.fetch(false)

      if (!pos.isNearTo(target)) {
        if (duet.fullHealed) {
          duet.moveTo(target)
        } else {
          const dealers = room.findHostileCreeps()
          duet.moveToWithSafety(target, calc, dealers)
        }
      }
      return duet.attack(target)
    }
  }

  get keeperPresent() {
    return !!this.duet?.keeper
  }

  get protectorPresent() {
    return !!this.duet?.protector
  }

  private recover() {
    const creeps = this.room.memory[RoomMemoryKeys.duet]
    if (!creeps) return
    const keeper = Game.creeps[creeps[0]]
    const protector = Game.creeps[creeps[1]]
    if (
      keeper &&
      keeper.memory.role === Role.DUAL &&
      protector &&
      protector.memory.role === Role.DUAL
    )
      this.duet = new Duet(keeper, protector)
    else delete this.room.memory[RoomMemoryKeys.duet]
  }

  private safeDestroyDuet(duet: Duet) {
    const pos = duet.pos
    if (
      duet.safe &&
      !duet.atBorder &&
      (!pos || this.room.name === pos.roomName)
    ) {
      duet.destroy()
      delete this.duet
      delete this.room.memory[RoomMemoryKeys.duet]
    } else {
      duet.moveTo({ pos: this.room.sources.colonyPosition })
    }
  }

  private findOrCreateDuet() {
    if (this.duet) return this.duet
    const creeps = this.room.memory.creeps
    if (!creeps) return
    const keeperName = Object.keys(creeps).find(
      (c) => Game.creeps[c]?.memory.role === Role.DESTROYER,
    )
    if (!keeperName) return
    const protectorName = Object.keys(creeps).find(
      (c) => Game.creeps[c]?.memory.role === Role.TOWER_EKHAUSTER,
    )
    if (!protectorName) return
    const keeper = Game.creeps[keeperName]
    const protector = Game.creeps[protectorName]
    keeper.memory.role = Role.DUAL
    protector.memory.role = Role.DUAL
    this.room.memory[RoomMemoryKeys.duet] = [keeper.name, protector.name]
    return (this.duet = new Duet(keeper, protector))
  }

  private get targetRoom() {
    return this.room.memory[RoomMemoryKeys.ekhaust]
  }
}
