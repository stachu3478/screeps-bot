import { SUCCESS, NOTHING_TODO } from '../../constants/response'
import { getXYWall } from 'utils/selectFromPos'

// make walls around controller
export default class WallPlacer {
  private controller: StructureController
  private room: Room

  constructor(controller: StructureController) {
    this.room = controller.room
    this.controller = controller
  }

  create() {
    const controllerPos = this.controller.pos
    const colonySourcePositions = this.room.sources.positions
    for (let x = -1; x < 2; x++)
      for (let y = -1; y < 2; y++) {
        const xPos = controllerPos.x + x
        const yPos = controllerPos.y + y
        const notBlockingSources = colonySourcePositions.every(({ x, y }) => {
          return xPos !== x || yPos !== y
        })
        if (!notBlockingSources) continue
        const wall = getXYWall(this.room, xPos, yPos)
        if (wall) continue
        const result = this.room.createConstructionSite(
          xPos,
          yPos,
          STRUCTURE_WALL,
        )
        if (result === 0) return true
      }
    return false
  }
}
