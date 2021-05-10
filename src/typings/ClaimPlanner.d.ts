interface ClaimConfig {
  minCost: number
  maxCost: number
  minSources: number
  maxRooms: number
  shards: {
    [key: string]:
      | {
          minCost: number
          maxRooms: number
        }
      | undefined
  }
}

interface ClaimTarget {
  source: string
  target: string
}

declare class ClaimPlanner {
  constructor(config: ClaimConfig)
  target: ClaimTarget | null
}
