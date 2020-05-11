import { cheapMove } from 'utils/path'
import { SUCCESS, NOTHING_TODO, NOTHING_DONE, FAILED, NO_RESOURCE } from 'constants/response'
import handleTerminal from 'utils/handleTerminal';

interface MineralFillCreep extends Creep {
  memory: MineralFillCMemory
}

interface MineralFillCMemory extends CreepMemory { }

export default function mineralFill(creep: MineralFillCreep, mineralType: MineralConstant) {
  if (creep.store[mineralType] === 0) return NO_RESOURCE
  const room = Game.rooms[creep.memory.room]
  let target: AnyStoreStructure | undefined = room.terminal
  if (!target || target.store.getFreeCapacity(mineralType) === 0) target = room.storage
  else if (creep.pos.isNearTo(target)) handleTerminal(target, mineralType)
  if (!target || target.store.getFreeCapacity(mineralType) === 0) return NOTHING_TODO
  const result = creep.transfer(target, mineralType)
  const remaining = creep.store[mineralType] - target.store.getFreeCapacity(mineralType)
  if (result === ERR_NOT_IN_RANGE) cheapMove(creep, target)
  else if (result !== 0) return FAILED
  else {
    if (remaining <= 0) return NO_RESOURCE
    return SUCCESS
  }
  return NOTHING_DONE
}
