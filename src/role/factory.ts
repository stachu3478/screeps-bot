import { infoStyle } from "room/style";
import { IDLE, FACT_WORKING, FACT_BOARD } from "constants/state";
import handleFactory, { com, factoryStoragePerResource, isProducableByFactory } from "utils/handleFactory";

export default function factory(factory: StructureFactory) {
  const mem = factory.room.memory
  switch (mem.factoryState) {
    case IDLE:
      factory.room.visual.text('Factory: Idle', 0, 6, infoStyle)
      break
    case FACT_BOARD:
      factory.room.visual.text('Factory: Withdrawing', 0, 6, infoStyle)
      mem.factoryState = FACT_WORKING
      break
    case FACT_WORKING:
      if (factory.cooldown) return
      if (!mem.factoryProducing) {
        for (const name in com) {
          if (factory.store[name as ResourceConstant] >= factoryStoragePerResource) continue
          if (REACTIONS[name]) continue
          if (name === RESOURCE_ENERGY) continue
          if (com[name].level && factory.level !== com[name].level) continue
          if (isProducableByFactory(factory.store, name as ResourceConstant)) {
            mem.factoryProducing = name as ResourceConstant
          }
        }
        mem.factoryState = IDLE
        if (factory.room.terminal) handleFactory(factory.room.terminal.store, factory)
        else if (factory.room.storage) handleFactory(factory.room.storage.store, factory)
        break
      }
      // @ts-ignore no generic type for produced factory resource
      const result = factory.produce(mem.factoryProducing)
      factory.room.visual.text('Factory: Producing ' + mem.factoryProducing, 0, 6, infoStyle)
      if (result === ERR_NOT_ENOUGH_RESOURCES) delete mem.factoryProducing
      break
    default: mem.factoryState = IDLE
  }
}
