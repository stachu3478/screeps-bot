import {
  NOTHING_TODO,
  NOTHING_DONE,
  DONE,
  NO_RESOURCE,
  FAILED,
  ACCEPTABLE,
} from 'constants/response'
import harvest from 'routine/work/harvest'
import autoFill from 'routine/haul/autoFill'
import autoRepair from 'routine/work/autoRepair'
import autoBuild from 'routine/work/autoBuild'
import ProfilerPlus from 'utils/ProfilerPlus'

export interface RemoteMiner extends Creep {
  memory: RemoteMinerMemory
}

export interface RemoteMinerMemory extends CreepMemory {
  mine?: Lookup<RoomPosition>
}

export default ProfilerPlus.instance.overrideFn(function miner(
  creep: RemoteMiner,
) {
  /* code here */
},
'roleRemoteMiner')
