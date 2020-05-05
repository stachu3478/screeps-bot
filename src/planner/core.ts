import _ from 'lodash'
import PlannerMatrix from './matrix'
import dump from './dump'
import pos, { posToChar } from './pos'

export default function plan(room: Room) {
  if (!room.controller) return
  const terrain = room.getTerrain()
  const pm = new PlannerMatrix(terrain)
  const matrix = pm.getMatrix()
  const controllerPos = room.controller ? room.controller.pos : new RoomPosition(0, 0, room.name)

  // find all paths and mark in matrix
  interface SourceMap {
    [id: string]: string
  }
  const sources = room.find(FIND_SOURCES)
  let furthestSource = sources[0]
  let nearestSource = sources[0]
  let shortestPathLength = Infinity
  let furthestPath: RoomPosition[] = []
  const sourcePositions: SourceMap = {}
  const costMatrix = new PathFinder.CostMatrix()
  const roomCallback = (roomName: string) => roomName === room.name ? costMatrix : false;
  sources.forEach(s1 => {
    sources.forEach(s2 => {
      if (s1 === s2) return
      const path = s1.pos.findPathTo(s2, { ignoreCreeps: true, ignoreDestructibleStructures: true, ignoreRoads: true })
      path.forEach((ps) => {
        costMatrix.set(ps.x, ps.y, 1)
      })
    })
  })
  sources.forEach(obj => {
    const ps = obj.pos
    const { path } = PathFinder.search(
      new RoomPosition(ps.x, ps.y, room.name),
      { pos: controllerPos, range: 3 },
      { plainCost: 2, roomCallback }
    )
    path.forEach((s: RoomPosition, step: number) => {
      if (s === obj.pos) return
      pm.setField(s.x, s.y, step + 1)
      costMatrix.set(s.x, s.y, 1)
    })
    sourcePositions[obj.id] = posToChar(path[0]) + String.fromCharCode(path.length)
    if (path.length > furthestPath.length) {
      furthestSource = obj
      furthestPath = path
    }
    if (path.length < shortestPathLength) {
      nearestSource = obj
      shortestPathLength = path.length
    }
  })

  // find path to prospect time to travel to routine place
  sources.forEach(obj => {
    if (obj === furthestSource) {
      sourcePositions[obj.id] += String.fromCharCode(0)
      return
    }
    const ps = obj.pos
    const { path } = PathFinder.search(
      new RoomPosition(ps.x, ps.y, room.name),
      furthestSource.pos,
      { plainCost: 2, roomCallback }
    )
    sourcePositions[obj.id] += String.fromCharCode(path.length)
  })

  pm.coverBorder() // fill the covers to block iteration

  // initially plan structures
  const structsCountGoal = _.sum(CONTROLLER_STRUCTURES, (s) => {
    const max = _.max(s)
    if (max === 2500 || typeof max !== 'number') return 0
    return max
  })
  const structurePoses: number[] = []
  const structureCosts: number[] = []
  furthestPath.forEach(({ x, y }) => {
    if (pm.getStructuresCount() >= structsCountGoal) return
    for (let ox = -1; ox <= 1; ox++)
      for (let oy = -1; oy <= 1; oy++) {
        const xy = pos(x + ox, y + oy)
        if (matrix[xy] === 0 && terrain.get(x + ox, y + oy) !== 1) {
          pm.setField(x + ox, y + oy, -1)
          structurePoses.push(pos(x + ox, y + oy))
          structureCosts.push(matrix[pos(x, y)])
        }
        if (pm.getStructuresCount() >= structsCountGoal) return
      }
  })

  let variation = 0
  let prevCount = pm.getStructuresCount()
  while (pm.getStructuresCount() < structsCountGoal) {
    const pos = variation++
    pm.setFieldRef(pos, -1)
    if (prevCount !== pm.getStructuresCount()) {
      prevCount = pm.getStructuresCount()
      structurePoses.push(pos)
      structureCosts.push(Infinity)
    }
  }

  // try to improve distance from desired source to structures with max 100 ops
  const pathPoses = furthestPath.map(({ x, y }) => pos(x, y))
  const pathNewPoses: number[] = []
  let currentPos = pathPoses.shift() || 0
  let c = 100
  while (c-- > 0) {
    let done = false
    if (done || matrix[currentPos] >= structureCosts[structureCosts.length - 1]) break // optimal solution found
    const result = pm.getBestPos(currentPos & 63, currentPos >> 6)
    if (result.rank > 1) {
      const x = result.pos & 63
      const y = result.pos >> 6
      if (matrix[result.pos] === -1) {
        structureCosts.push(structureCosts[structureCosts.length - 1])
        structurePoses.push(structurePoses[structurePoses.length - 1])
      }
      pm.setFieldRef(result.pos, matrix[currentPos] + 1, true)
      for (let ox = -1; ox <= 1; ox++)
        for (let oy = -1; oy <= 1; oy++) {
          const xy = pos(x + ox, y + oy)
          if (matrix[xy] === 0 && terrain.get(x + ox, y + oy) !== 1) {
            if (matrix[currentPos] >= structureCosts[structureCosts.length - 1]) {
              done = true
              break
            } // optimal solution found
            pm.setField(x + ox, y + oy, -1)
            pm.setFieldRef(structurePoses.pop() || 0, 0, true)
            structureCosts.pop()
          }
        }
      pathNewPoses.push(result.pos)
    } else {
      let newPos
      if (pathNewPoses[0] && (matrix[pathPoses[0]] || 0) > matrix[pathNewPoses[0]]) {
        newPos = pathNewPoses.shift() || 0
      } else newPos = pathPoses.shift() || 0
      if (typeof newPos !== 'number') return
      currentPos = newPos
    }
    // break
  }

  dump(room, pm, sourcePositions, furthestSource.id, nearestSource.id)
};
