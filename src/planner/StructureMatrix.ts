import PathMatrix from './PathMatrix'

export default class StructureMatrix {
  private pathMatrix: PathMatrix
  private matrix: CostMatrix
  private terrain: RoomTerrain
  private structurePositions: RoomPosition[] = []
  private exits: RoomPosition[]

  constructor(room: Room, pathMatrix: PathMatrix) {
    this.exits = room.find(FIND_EXIT)
    this.terrain = room.getTerrain()
    this.pathMatrix = pathMatrix
    this.matrix = new PathFinder.CostMatrix()
  }

  findPositionsByColor(color: number) {
    return this.structurePositions.filter((pos) => {
      return this.matrix.get(pos.x, pos.y) === color
    })
  }

  add(pos: RoomPosition, color = 1, asRoad = false) {
    if (this.canBeAdded(pos, undefined, asRoad)) {
      this.matrix.set(pos.x, pos.y, color)
      this.structurePositions.push(pos)
    }
  }

  remove(pos: RoomPosition) {
    this.matrix.set(pos.x, pos.y, 0)
    this.structurePositions = this.structurePositions.filter(
      (p) => !p.isEqualTo(pos),
    )
  }

  canBeAdded(pos: RoomPosition, blackMatrix?: StructureMatrix, asRoad = false) {
    if (blackMatrix?.isStructure(pos)) {
      return false
    }
    return (
      !this.isStructure(pos) &&
      (asRoad || !this.pathMatrix.isRoad(pos)) &&
      this.terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL &&
      !this.exits.some((exit) => exit.isNearTo(pos))
    )
  }

  isStructure(pos: RoomPosition) {
    return this.matrix.get(pos.x, pos.y) !== 0
  }

  get positions() {
    return this.structurePositions
  }
}
