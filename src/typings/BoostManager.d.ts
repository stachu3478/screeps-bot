declare class BoostManager {
  getAmountReserved: (resource: ResourceConstant) => number
  getAvailable: (resource: ResourceConstant, partCount: number) => number
  getBestAvailable: (
    partType: BodyPartConstant,
    action: string,
    partCount: number,
  ) => BoostInfo | null
  getRequest: (creepName: string) => Id<StructureLab> | undefined
  createRequest: (
    creepName: string,
    resource: ResourceConstant,
    partCount: number,
    mandatory?: boolean,
  ) => void
  clearRequest: (
    creepName: string,
    resource: ResourceConstant | null,
    done?: boolean,
  ) => void
  prepareData: (
    creepMemory: CreepMemory,
    parts: BodyPartConstant[],
    actions: string[],
    body: BodyPartConstant[],
  ) => BoostInfo[]
  hasMandatory: (creepName: string) => boolean
  labs: BoostData['labs']
  creeps: BoostData['creeps']
}
