export default function handleLog(room: ControlledRoom, logs: EventItem[]) {
  const mem = room.memory
  logs.forEach(l => {
    switch (l.event) {
      case EVENT_ATTACK:
        if (l.data.attackType === EVENT_ATTACK_TYPE_HIT_BACK) return;
      case EVENT_ATTACK_CONTROLLER:
        const creep = Game.getObjectById(l.objectId as Id<Creep>)
        if (!Memory.whitelist) Memory.whitelist = {}
        if (creep && creep.owner && Memory.whitelist[creep.owner.username]) {
          const message = `${creep.owner.username} has been removed from the whitelist due to violating peace regulations`
          console.log(message)
          Game.notify(message, 5)
          delete Memory.whitelist[creep.owner.username]
        }
        break
      case EVENT_OBJECT_DESTROYED:
        const type = l.data.type
        if (type !== LOOK_CREEPS) {
          if (type === STRUCTURE_ROAD) mem._roadBuilt = false
          else mem._built = false
          if (type === STRUCTURE_LINK) mem._linked = 0
        }
        break
      case EVENT_UPGRADE_CONTROLLER:
        const controllerLevel = room.controller.level
        if (controllerLevel !== mem._lvl) {
          mem._built = false
          mem._lvl = controllerLevel
          mem._struct_iteration = 0
        }
    }
  })
}
