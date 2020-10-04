interface Object {
  [key: number]: number
}

export const SUCCESS = 0
export const NOTHING_TODO = 1
export const NOTHING_DONE = 2
export const FAILED = 3
export const NO_RESOURCE = 4
export const DONE = 5
export const ACCEPTABLE: Object = {
  [SUCCESS]: 0,
  [DONE]: 0,
  [NOTHING_DONE]: 0,
}
