import LabPlanner from 'planner/LabPlanner'
import LeastAvailablePositionPlanner from 'planner/LeastAvailablePositionPlanner'
import ShieldPlanner from 'planner/ShieldPlanner'

export default class RoomPositions {
  private shieldPlanner: ShieldPlanner
  private labPlanner: LabPlanner
  private leastAvailablePlanner: LeastAvailablePositionPlanner

  constructor(room: Room) {
    this.shieldPlanner = new ShieldPlanner(room)
    this.labPlanner = new LabPlanner(room)
    this.leastAvailablePlanner = new LeastAvailablePositionPlanner(room)
  }

  get leastAvailable() {
    return this.leastAvailablePlanner.roomPosition
  }

  get forShield() {
    return this.shieldPlanner.roomPositions
  }

  get forLabs() {
    return this.labPlanner.roomPositions
  }
}
