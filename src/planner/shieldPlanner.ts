import { posToChar } from './pos'
import charPosIterator from 'utils/charPosIterator'
import { createUnwalkableMatrix } from 'utils/path'

export default class ShieldPlanner {
  private positions: RoomPosition[]
  private room: Room

  constructor(room: Room) {
    this.room = room
    this.positions = []
    const shieldsMemory = room.memory[RoomMemoryKeys.shields]
    if (shieldsMemory) this.generateFromMemory(shieldsMemory)
    else this.generate()
  }

  get roomPositions() {
    return this.positions
  }

  private generateFromMemory(shieldMemory: string) {
    this.positions = shieldMemory
      .split('')
      .map((c) => this.room.positionFromChar(c))
  }

  private generate() {
    const structs = this.room.memory.structs
    if (!structs) return

    const positionsToBeShielded: RoomPosition[] = []
    structs.split('').forEach((charPos, i) => {
      // lookup first spawn, storage and towers
      const position = this.room.positionFromChar(charPos)
      if (i < 3 || (i > 4 && i < 11)) positionsToBeShielded.push(position)
    })

    this.generateFromPathTargets(positionsToBeShielded)
    this.room.memory[RoomMemoryKeys.shields] = [
      ...new Set(this.positions.map(posToChar)),
    ].join('')
  }

  private generateFromPathTargets(targets: RoomPosition[]) {
    this.positions = targets.slice(0)
    const initialPosition = targets.shift()!
    const costMatrix = this.onlyPlannedPathCostMatrix
    targets.forEach((roomPosition) => {
      const path = PathFinder.search(
        initialPosition,
        { pos: roomPosition, range: 1 },
        {
          roomCallback: () => costMatrix,
        },
      )
      this.positions = this.positions.concat(path.path)
    })
  }

  private get onlyPlannedPathCostMatrix() {
    const roads = this.room.memory.roads || ''
    const costMatrix = createUnwalkableMatrix()
    charPosIterator(roads, (x, y) => {
      costMatrix.set(x, y, 1)
    })
    return costMatrix
  }
}
