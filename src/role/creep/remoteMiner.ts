import ProfilerPlus from 'utils/ProfilerPlus'
import MemoryHandler from 'handler/MemoryHandler'
import move from 'utils/path/path'
import recycle from 'routine/recycle'
import { tankPack } from 'spawn/body/body'
import { maintainBuildingActively } from 'routine/work/maintainBuilding'

export default ProfilerPlus.instance.overrideFn(function miner(
  creep: RoleCreep<Role.REMOTE_MINER>,
) {
  const lookup = creep.memory.mine
  const sourcePosition = RoomPosition.from(lookup)
  const miningTarget = MemoryHandler.sources[lookup]
  if (!miningTarget) {
    recycle(creep)
    return
  }
  const roomName = sourcePosition.roomName
  const miningRoom = Game.rooms[roomName]
  const invaders = miningRoom?.findHostileCreeps((c) => c.corpus.armed).length
  const miningPosition = RoomPosition.from(miningTarget.miningPosition)
  const motherRoom = creep.motherRoom
  if (invaders) {
    motherRoom.outpostDefense.request(miningRoom)
  }
  if (
    miningRoom?.buildings.invaderCore &&
    (!motherRoom.memory._attack ||
      motherRoom.memory._attack === miningRoom.name)
  ) {
    motherRoom.memory._attack = miningRoom.name
    motherRoom.memory._attackLevel = Math.floor(
      (motherRoom.energyCapacityAvailable -
        BODYPART_COST[HEAL] -
        BODYPART_COST[MOVE]) /
        tankPack,
    )
  }
  if (roomName !== creep.room.name) {
    creep.moveToRoom(roomName)
  } else if (!creep.pos.isEqualTo(miningPosition)) {
    move.cheap(creep, miningPosition)
  } else {
    const source = sourcePosition.lookFor(LOOK_SOURCES)[0]
    if (
      !(
        !creep.store.getFreeCapacity() &&
        maintainBuildingActively(creep, miningPosition, STRUCTURE_CONTAINER)
      )
    ) {
      creep.harvest(source)
    }
  }
},
'roleRemoteMiner')
