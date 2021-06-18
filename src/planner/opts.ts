export const getWorkSaturation = (workTime: number, moveTime: number): number =>
  workTime / (workTime + moveTime)
export const getEnergyMinedPerTick = (capacity: number) =>
  capacity / ENERGY_REGEN_TIME
export const getMaximumWorkPartsForSource = (workSaturation: number): number =>
  getEnergyMinedPerTick(SOURCE_ENERGY_CAPACITY) / workSaturation / HARVEST_POWER
export const getCarryNeeded = (cost: number, sourceEnergyCapacity: number) =>
  Math.ceil(
    (getEnergyMinedPerTick(sourceEnergyCapacity) * cost) / CARRY_CAPACITY,
  )
