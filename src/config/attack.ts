import _ from 'lodash'

export default {
  structurePriority: _.invert(
    [
      STRUCTURE_INVADER_CORE,
      STRUCTURE_SPAWN,
      STRUCTURE_NUKER,
      STRUCTURE_TOWER,
      STRUCTURE_LAB,
      STRUCTURE_EXTRACTOR,
      STRUCTURE_OBSERVER,
      STRUCTURE_POWER_SPAWN,
      STRUCTURE_EXTENSION,
      STRUCTURE_RAMPART,
      STRUCTURE_WALL,
      STRUCTURE_ROAD,
      'none',
    ].reverse(),
  ) as {
    [key: string]: number | undefined
  },
}
