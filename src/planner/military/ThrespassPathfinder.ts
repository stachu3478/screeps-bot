import HitCalculator from 'room/military/HitCalculator'

const SOURCE = 1
const TARGET = 2
const WALKABLE = 4
const UNWALKABLE = 128
export default class ThrespassPathfinder {
  private source: RoomPosition
  private targets: RoomPosition[]
  private found = false
  private matrix = new PathFinder.CostMatrix()
  private hitCalculator?: HitCalculator
  private enemies: Creep[] = []
  private thresholdDamage = 0
  private leastHigherThresholdDamage = Infinity

  constructor(source: RoomPosition, targets: RoomPosition[]) {
    this.source = source
    this.targets = targets
  }

  search(room: Room, hitCalculator = new HitCalculator(room)) {
    this.hitCalculator = hitCalculator
    this.hitCalculator.fetch(false)
    this.enemies = room.find(FIND_CREEPS).filter((c) => !c.my && c.corpus.armed)
    this.find()
    return this.reproduce()
  }

  private find() {
    const sourceFields = [this.source]
    const targetFields = this.targets
    this.thresholdDamage = Math.max(
      this.getDamage(this.source),
      Math.min(...this.targets.map((t) => this.getDamage(t))),
    )
    let currentSource = sourceFields
    let currentTarget = targetFields
    while (!this.found) {
      while (currentSource.length && currentTarget.length) {
        let newSource: RoomPosition[] = []
        let newTarget: RoomPosition[] = []
        currentSource.forEach((pos) => {
          this.mark(pos, sourceFields, currentSource, SOURCE)
        })
        currentTarget.forEach((pos) => {
          this.mark(pos, targetFields, currentTarget, TARGET)
        })
        currentSource = newSource
        currentTarget = newTarget
      }
      if (this.leastHigherThresholdDamage === Infinity) {
        return
      }
      this.thresholdDamage = this.leastHigherThresholdDamage
      this.leastHigherThresholdDamage = Infinity
      currentSource = sourceFields
      currentTarget = targetFields
    }
    sourceFields.forEach((pos) => this.matrix.set(pos.x, pos.y, 1))
    targetFields.forEach((pos) => this.matrix.set(pos.x, pos.y, 1))
    console.log('Found with threspass damage: ', this.thresholdDamage)
  }

  private mark(
    pos: RoomPosition,
    allFields: RoomPosition[],
    testingFields: RoomPosition[],
    type: number,
  ) {
    pos.eachOffset((offset) => {
      const mark = this.matrix.get(offset.x, offset.y)
      if (mark | UNWALKABLE) {
        return
      } else if (!(mark | WALKABLE)) {
        const walkable = offset.isWalkable()
        this.matrix.set(
          offset.x,
          offset.y,
          mark & (walkable ? UNWALKABLE : WALKABLE),
        )
        if (!walkable) {
          return
        }
      }
      if (mark | this.opposite(type)) {
        this.found = true
      }
      if (!mark) {
        allFields.push(offset)
      }
      const damage = this.getDamage(offset)
      if (damage > this.thresholdDamage) {
        if (damage < this.leastHigherThresholdDamage) {
          this.leastHigherThresholdDamage = damage
        }
        return
      }
      if (!(mark | type)) {
        testingFields.push(offset)
        this.matrix.set(offset.x, offset.y, mark & type)
      }
    })
  }

  private reproduce() {
    return PathFinder.search(this.source, this.targets, {
      maxRooms: 1,
      roomCallback: () => this.matrix,
    })
  }

  private opposite(sourceOrTarget: number) {
    if (sourceOrTarget === TARGET) {
      return SOURCE
    }
    return TARGET
  }

  private getDamage(pos: RoomPosition) {
    return this.hitCalculator!.getDamage(pos, this.enemies)
  }

  get damage() {
    return this.thresholdDamage
  }
}
