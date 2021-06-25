import _ from 'lodash'
import { memoizeBy, memoizeByRoom } from './memoize'

export const cache = memoizeBy(() => ({}))
export const roomCache = memoizeByRoom(() => ({
  scoutsWorking: 0,
  sourceKeeperPositions: [],
  structurePositions: [],
}))
