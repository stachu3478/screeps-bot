const enum Role {
  HARVESTER = 1,
  UPGRADER = 2,
  SCOUT = 3,
  COMMANDER = 4,
  CLAIMER = 5,
  MINER = 6,
  RETIRED = 7,
  EXTRACTOR = 8,
  FIGHTER = 9,
  STATIC_UPGRADER = 10,
  COLONIZER = 11,
  FACTORY_MANAGER = 12,
  LAB_MANAGER = 13,
  HAULER = 14,
  BOOSTER = 15,
  MOVE_TO_FLAG = 16,
  RANGER = 17,
  MOVER = 20,
  BUILDER = 21,
  TOWER_EKHAUSTER = 22,
  DESTROYER = 23,
  DUAL = 24,
  DEPOSIT_MINER = 25,
  REMOTE_MINER = 26,
  COLLECTOR = 27,
  DEFENDER = 28,
  RESERVER = 29,
}
interface RoleCreepMemory<T> extends CreepMemory {
  role: T & Role
  mine: T extends Role.REMOTE_MINER ? Lookup<RoomPosition> : undefined
  collect: T extends Role.COLLECTOR ? Lookup<RoomPosition> : undefined
  newRole: T extends Role.COLONIZER | Role.BOOSTER ? Role : undefined
  reserve: T extends Role.RESERVER ? string : undefined
}
interface RoleCreep<T> extends Creep {
  memory: RoleCreepMemory<T>
}
