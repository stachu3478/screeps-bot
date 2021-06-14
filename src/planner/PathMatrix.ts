const ROAD_MASK = 1
export default class PathMatrix {
  private matrix: CostMatrix
  private paths: [RoomPosition, RoomPosition, PathFinderPath][] = []
  private setPaths: RoomPosition[] = []

  constructor() {
    this.matrix = new PathFinder.CostMatrix()
  }

  set(pos: RoomPosition) {
    if (this.matrix.get(pos.x, pos.y) === 0) {
      this.matrix.set(pos.x, pos.y, ROAD_MASK)
      this.setPaths.push(pos)
      console.log('road added', pos)
    }
  }

  remove(pos: RoomPosition) {
    if (this.matrix.get(pos.x, pos.y) === 1) {
      this.matrix.set(pos.x, pos.y, 0)
      this.setPaths.splice(
        this.setPaths.findIndex((p) => p.isEqualTo(pos)),
        1,
      )
      console.log('road removed', pos)
    }
  }

  add(source: RoomPosition, pos: RoomPosition, range = 0) {
    const pathfindingOpts: PathFinderOpts = {
      plainCost: 2,
      swampCost: 3,
      maxRooms: 1,
      roomCallback: () => this.matrix,
    }
    const result = PathFinder.search(source, { pos, range }, pathfindingOpts)
    result.path.forEach((position) => this.set(position))
    this.paths.push([source, pos, result])
    return result
  }

  addClosest(source: RoomPosition, target: FindExitConstant, range = 0) {
    const pathfindingOpts: PathFinderOpts & FindPathOpts = {
      ignoreCreeps: true,
      ignoreDestructibleStructures: true,
      plainCost: 2,
      swampCost: 3,
      maxRooms: 1,
      roomCallback: () => this.matrix,
    }
    const position = source.findClosestByPath(target, pathfindingOpts)
    if (!position) {
      throw new Error('Failed to add closest object to path matrix')
    }
    return this.add(source, position, range)
  }

  isRoad(pos: RoomPosition) {
    return this.matrix.get(pos.x, pos.y) === ROAD_MASK
  }

  find(source: RoomPosition, pos: RoomPosition) {
    const triple = this.paths.find(
      ([s, t]) => source.isEqualTo(s) && pos.isEqualTo(t),
    )
    if (!triple) {
      throw new Error('Precomputed path not found')
    }
    return triple[2]
  }

  markOffsets(pos: RoomPosition) {
    pos.eachOffset((offsetPos) => {
      this.set(offsetPos)
    })
  }

  get positions() {
    return this.setPaths
  }
}
