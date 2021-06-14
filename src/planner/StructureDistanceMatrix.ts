import StructureMatrix from './StructureMatrix'

export default class StructureDistanceMatrix {
  private structureMatrix: StructureMatrix
  private matrix: CostMatrix

  constructor(structureMatrix: StructureMatrix) {
    this.structureMatrix = structureMatrix
    this.matrix = new PathFinder.CostMatrix()
  }

  init(pos: RoomPosition) {
    this.matrix.set(pos.x, pos.y, 1)
  }

  add(pos: RoomPosition, distance?: number) {
    this.structureMatrix.add(pos)
    const currentDistance = this.matrix.get(pos.x, pos.y)
    if (!currentDistance) {
      this.matrix.set(pos.x, pos.y, distance || this.createDistance(pos))
    }
    console.log('structure added', pos)
  }

  remove(position: RoomPosition) {
    this.structureMatrix.remove(position)
    console.log('structure removed', position)
  }

  isStructure(position: RoomPosition) {
    return this.structureMatrix.isStructure(position)
  }

  addStructuresAround(pos: RoomPosition, blackMatrix?: StructureMatrix) {
    const positionsAdded: RoomPosition[] = []
    pos.eachOffset((offsetPos) => {
      if (this.structureMatrix.canBeAdded(offsetPos, blackMatrix)) {
        this.add(offsetPos)
        positionsAdded.push(offsetPos)
      }
    })
    return positionsAdded
  }

  createDistance(pos: RoomPosition, defaultDistance = 100) {
    let nextDistance = defaultDistance
    pos.eachOffset((offsetPos) => {
      const current = this.matrix.get(offsetPos.x, offsetPos.y)
      if (current === 0) {
        return
      }
      if (current < nextDistance) {
        nextDistance = current
      }
    })
    return nextDistance + 1
  }

  get positions() {
    return this.structureMatrix.positions
  }
}
