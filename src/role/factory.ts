import { infoStyle } from 'room/style'
import handleFactory, {
  com,
  factoryStoragePerResource,
  isProducableByFactory,
} from 'utils/handleFactory'

export default function factory(factory: StructureFactory) {
  const cache = factory.cache
  switch (cache.state) {
    case State.IDLE:
      factory.room.visual.text('Factory: Idle', 0, 6, infoStyle)
      break
    case State.FACT_BOARD:
      factory.room.visual.text('Factory: Withdrawing', 0, 6, infoStyle)
      cache.state = State.FACT_WORKING
      break
    case State.FACT_WORKING:
      if (factory.cooldown) return
      if (!cache.producing) {
        for (const name in com) {
          if (
            factory.store[name as ResourceConstant] >= factoryStoragePerResource
          )
            continue
          if (REACTIONS[name]) continue
          if (name === RESOURCE_ENERGY) continue
          if (com[name].level && factory.level !== com[name].level) continue
          if (isProducableByFactory(factory.store, name as ResourceConstant)) {
            cache.producing = name as ResourceConstant
          }
        }
        cache.state = State.IDLE
        if (factory.room.terminal)
          handleFactory(factory.room.terminal.store, factory)
        else if (factory.room.storage)
          handleFactory(factory.room.storage.store, factory)
        break
      }
      // @ts-ignore no generic type for produced factory resource
      const result = factory.produce(cache.producing)
      factory.room.visual.text(
        'Factory: Producing ' + cache.producing,
        0,
        6,
        infoStyle,
      )
      if (result === ERR_NOT_ENOUGH_RESOURCES) delete cache.producing
      break
    default:
      cache.state = State.IDLE
  }
}
