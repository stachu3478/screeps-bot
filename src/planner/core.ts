import _ from 'lodash'
import PlannerMatrix from './matrix'
import dump from './dump'
import pos, { posToChar } from './pos'
import planLink from './links'
import whirl from 'utils/whirl'
import xyToChar from './pos'
import range from 'utils/range'

export default function plan(room: Room) {
  if (!room.controller) return
  const terrain = room.getTerrain()
  const pm = new PlannerMatrix(terrain)
  const matrix = pm.getMatrix()
  const controllerPos = room.controller.pos

  // find all paths and mark in matrix
  const sources = room.find(FIND_SOURCES)
  let furthestSource = sources[0]
  let nearestSource = sources[0]
  let shortestPathLength = Infinity
  let furthestPath: RoomPosition[] = []
  const sourcePositions: SourceMap = {}
  const costMatrix = new PathFinder.CostMatrix()
  const roomCallback = (roomName: string) =>
    roomName === room.name ? costMatrix : false
  sources.forEach((s1) => {
    sources.forEach((s2) => {
      if (s1 === s2) return
      const path = s1.pos.findPathTo(s2, {
        ignoreCreeps: true,
        ignoreDestructibleStructures: true,
        ignoreRoads: true,
      })
      path.forEach((ps) => {
        costMatrix.set(ps.x, ps.y, 1)
      })
    })
  })
  sources.forEach((obj) => {
    const ps = obj.pos
    const { path } = PathFinder.search(
      new RoomPosition(ps.x, ps.y, room.name),
      { pos: controllerPos, range: 3 },
      { plainCost: 2, roomCallback },
    )
    path.forEach((s: RoomPosition, step: number) => {
      if (s === obj.pos) return
      pm.setField(s.x, s.y, step + 1)
      costMatrix.set(s.x, s.y, 1)
    })
    // ascetic polyfill where path length to controller is 0
    if (!path[0]) {
      whirl(ps.x, ps.y, (x, y) => {
        if (terrain.get(x, y) === 0) {
          path[0] = new RoomPosition(x, y, room.name)
          return true
        }
        return false
      })
    }
    ///
    sourcePositions[obj.id] = posToChar(path[0])
    if (path.length > furthestPath.length) {
      furthestSource = obj
      furthestPath = path
    } else if (path.length < shortestPathLength) {
      nearestSource = obj
      shortestPathLength = path.length
    }
  })

  // find path to prospect time to travel to routine place
  sources.forEach((obj) => {
    if (obj === furthestSource) {
      sourcePositions[obj.id] += String.fromCharCode(1)
      return
    }
    const ps = obj.pos
    const { path } = PathFinder.search(
      new RoomPosition(ps.x, ps.y, room.name),
      furthestSource.pos,
      {
        plainCost: 2,
        roomCallback,
      },
    )
    planLink(room, sourcePositions[obj.id][0], matrix, terrain)
    // save path length
    sourcePositions[obj.id] += String.fromCharCode(path.length)
  })

  // plan controller link
  const { path } = PathFinder.search(
    furthestSource.pos,
    { pos: controllerPos, range: 3 },
    { plainCost: 2, roomCallback },
  )
  const lastPos = path[path.length - 1]
  planLink(
    room,
    new RoomPosition(lastPos.x, lastPos.y, room.name),
    matrix,
    terrain,
    -4,
  )

  pm.coverBorder() // fill the covers to block iteration

  // planPotencialPaths(room, furthestSource, pm, roomCallback)

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
          const minimalDistance = range(
            x - furthestSource.pos.x,
            y - furthestSource.pos.y,
          )
          structureCosts.push(Math.max(matrix[pos(x, y)], minimalDistance))
        }
        if (pm.getStructuresCount() >= structsCountGoal) return
      }
  })

  let variation = 0
  let prevCount = pm.getStructuresCount()
  while (pm.getStructuresCount() < structsCountGoal) {
    const pos = variation++
    if (matrix[pos] === 100) continue
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
  let c = 1000
  while (c-- > 0) {
    let done = false
    const px = currentPos & 63
    const py = currentPos >> 6
    if (done || matrix[currentPos] >= structureCosts[structureCosts.length - 1])
      break // optimal solution found
    const result = pm.getBestPos(px, py)
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
            if (
              matrix[currentPos] >= structureCosts[structureCosts.length - 1]
            ) {
              done = true
              break
            } // optimal solution found
            if (matrix[xyToChar(x + ox, y + oy)] === 100) continue
            pm.setField(x + ox, y + oy, -1)
            pm.setFieldRef(structurePoses.pop() || 0, 0, true)
            structureCosts.pop()
          }
        }
      pathNewPoses.push(result.pos)
    } else {
      let newPos
      if (
        pathNewPoses[0] &&
        (matrix[pathPoses[0]] || 0) > matrix[pathNewPoses[0]]
      ) {
        newPos = pathNewPoses.shift() || 0
      } else newPos = pathPoses.shift() || 0
      if (typeof newPos !== 'number') return
      currentPos = newPos
    }
    // break
  }

  dump(room, pm, sourcePositions, furthestSource.id, nearestSource.id)
}
