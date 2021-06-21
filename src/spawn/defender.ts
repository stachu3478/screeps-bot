import _ from 'lodash'
import SpawnCreep from './spawnCreep'

export default class SpawnDefender extends SpawnCreep {
  protected maxCount = 1
  private fulfillBody?: RangerBodyPartConstant[]

  run() {
    const memory = {
      role: this.role,
      room: this.spawn.room.name,
      deprivity: 0,
    }
    this.spawn.trySpawnCreep(this.body, 'F', memory, false, 10)
  }

  needs() {
    if (!super.needs()) {
      return false
    }
    return !!this.body.length
  }

  static success(name: string, body: BodyPartConstant[]) {
    const memory = Memory.creeps[name]
    const cost = _.sum(body, (type) => BODYPART_COST[type])
    Game.rooms[memory.room].remoteMiningMonitor.monit(-cost)
  }

  protected get energyRequired() {
    return _.sum(this.body, (type) => BODYPART_COST[type])
  }

  private get body() {
    if (!this.fulfillBody) {
      this.fulfillBody = this.room.outpostDefense.fulfillBody() || []
    }
    return this.fulfillBody
  }

  get role() {
    return Role.DEFENDER
  }
}
