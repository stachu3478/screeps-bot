import StructureMatcher from './matcher/structureMatcher'
import ResourceMatcher from './matcher/ResourceMatcher'
import _ from 'lodash'
import ResourceRoute from './ResourceRoute'

type StructureAndResources = [AnyStoreStructure, ResourceConstant[]]
export default class RoomResourceRoute {
  private room: Room
  private route: ResourceRoute
  private sourceMatcher: StructureMatcher
  private targetMatcher: StructureMatcher
  private resourceMatcher: ResourceMatcher

  constructor(room: Room, route: ResourceRoute) {
    this.room = room
    this.route = route
    this.sourceMatcher = this.route.from
    this.targetMatcher = this.route.to
    this.resourceMatcher = this.route.resource
  }

  findSourcesAndTargets(
    differ?: Structure,
    src: StructureAndResources[] = this.findSources(differ),
    tar: StructureAndResources[] = this.findTargets(differ),
  ) {
    const resources = _.intersection(
      _.flatten(_.collect(src, (s) => s[1])),
      _.flatten(_.collect(tar, (s) => s[1])),
    )
    const sources = src.filter((s) => _.intersection(s[1], resources).length)
    const targets = tar.filter((t) => _.intersection(t[1], resources).length)
    return [sources, targets]
  }

  selectTargetsBySource(
    src: StructureAndResources,
    tar: StructureAndResources[],
  ) {
    return tar
      .map((t) => {
        const res: StructureAndResources = [t[0], _.intersection(t[1], src[1])]
        return res
      })
      .filter((tar) => tar[1].length)
  }

  findSources(
    differ?: Structure,
    match: AnyStoreStructure[] = this.sourceMatcher.call(
      this.room,
    ) as AnyStoreStructure[],
  ) {
    return match
      .map((s) => this.glueStructureWithStored(s))
      .filter((s) => s[0] !== differ && s[1].length)
  }

  findTargets(
    differ?: Structure,
    match: AnyStoreStructure[] = this.targetMatcher.call(
      this.room,
    ) as AnyStoreStructure[],
  ) {
    return match
      .map((t) => this.glueStructureToFill(t))
      .filter((s) => s[0] !== differ && s[1].length)
  }

  reloadSourceAndTarget(source: AnyStoreStructure, target: AnyStoreStructure) {
    if (!this.route.validateSource(source)) return [[], []]
    if (!this.route.validateTarget(target)) return [[], []]
    return this.findSourcesAndTargets(
      undefined,
      [this.glueStructureWithStored(source)],
      [this.glueStructureToFill(target)],
    )
  }

  private glueStructureWithStored(s: AnyStoreStructure): StructureAndResources {
    return [s, this.resourceMatcher.findStored(s, this.route.minStored)]
  }

  private glueStructureToFill(t: AnyStoreStructure): StructureAndResources {
    return [
      t,
      this.resourceMatcher.findCanBeFilled(
        t,
        this.route.minimalFreeCapacityToFill,
        this.route.maximumFilledAmount,
      ),
    ]
  }
}
