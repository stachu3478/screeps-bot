declare class QuadSquadHandler {
  constructor(targetRoom: string)

  loop(): void

  addCreep(creep: Creep): void

  isAssembled(): boolean

  isActive(): boolean
}
