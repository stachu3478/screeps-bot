import ProfilerPlus from 'utils/ProfilerPlus'
import autoPickResource from './autoPickResource'

interface AutoPickCreep extends Creep {
  cache: AutoPickCache
}

interface AutoPickCache extends CreepCache {
  pick_pos?: string
}

export default ProfilerPlus.instance.overrideFn(function autoPick(
  creep: AutoPickCreep,
) {
  return autoPickResource(creep, RESOURCE_ENERGY)
},
'autoPickRoutine')
