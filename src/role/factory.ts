import handleFactory from 'utils/handleFactory'

export default function factory(factory: StructureFactory) {
  const cache = factory.cache
  switch (cache.state) {
    case State.IDLE:
      factory.room.visual.info('Factory: Idle', 0, 6)
      break
    case State.FACT_BOARD:
      factory.room.visual.info('Factory: Withdrawing', 0, 6)
      cache.state = State.FACT_WORKING
      break
    case State.FACT_WORKING:
      factory.room.visual.info('Factory: Producing ' + cache.producing, 0, 6)
      if (factory.cooldown) return
      if (!cache.producing || !factory.router.isValidRecipe(cache.producing)) {
        cache.producing = factory.router.findRecipeToProcess()
        if (!cache.producing) {
          cache.state = State.IDLE
          handleFactory(factory)
          return
        }
      }
      const result = factory.produce(cache.producing)
      if (result === ERR_NOT_ENOUGH_RESOURCES) delete cache.producing
      if (result === ERR_FULL) {
        cache.state = State.IDLE
        handleFactory(factory)
      }
      break
    default:
      cache.state = State.FACT_BOARD
  }
}
