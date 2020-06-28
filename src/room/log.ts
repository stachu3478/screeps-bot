export default function handleLog(mem: RoomMemory, controller: StructureController) {
  const logs = controller.room.getEventLog()
  logs.forEach(l => {
    switch (l.event) {
      case EVENT_ATTACK:
        if (l.data.attackType === EVENT_ATTACK_TYPE_HIT_BACK) break;
        const attacker = Game.getObjectById(l.objectId as Id<Creep>)
        if (!attacker || attacker.my) break
        const target = Game.getObjectById(l.data.targetId)
        if (!target) break
        const structure = target as Structure
        if (structure.structureType) {
          controller.room.memory.repaired = 0
          if (structure.structureType === STRUCTURE_SPAWN) {
            controller.activateSafeMode()
          }
        }
      case EVENT_ATTACK_CONTROLLER:
        const creep = Game.getObjectById(l.objectId as Id<Creep>)
        if (!creep || creep.my) break
        if (!Memory.whitelist) Memory.whitelist = {}
        if (creep.owner && Memory.whitelist[creep.owner.username]) {
          const message = `${creep.owner.username} has been removed from the whitelist due to violating peace regulations`
          console.log(message)
          Game.notify(message, 5)
          delete Memory.whitelist[creep.owner.username]
        }
        break
      case EVENT_OBJECT_DESTROYED:
        const type: EventDestroyType = l.data.type
        switch (type) {
          case LOOK_CREEPS: break
          case STRUCTURE_ROAD: mem._roadBuilt = 0; break
          case STRUCTURE_RAMPART: case STRUCTURE_WALL: mem._shielded = 0; break
          default: mem._built = 0; console.log("Structure has been destroyed: " + type)
        } break
      case EVENT_UPGRADE_CONTROLLER:
        const controllerLevel = controller.level
        if (controllerLevel !== mem._lvl) {
          mem._built = 0
          mem._shielded = 0
          mem._lvl = controllerLevel
          mem._struct_iteration = 0
        }
    }
  })
}
