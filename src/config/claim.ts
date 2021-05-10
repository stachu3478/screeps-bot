export default {
  minCost: 150,
  maxCost: 500,
  minSources: 2,
  maxRooms: Game.gcl.level - 9,
  shards: {
    shard3: {
      minCost: 50,
      maxRooms: Math.min(Game.gcl.level, 9),
    },
  },
}
