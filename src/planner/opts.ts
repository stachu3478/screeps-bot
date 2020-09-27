export const getWorkSaturation = (workTime: number, moveTime: number): number =>
  workTime / (workTime + moveTime)
export const getMaximumWorkPartsForSource = (workSaturation: number): number =>
  SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME / workSaturation / HARVEST_POWER
