import profiler from 'screeps-profiler'
import autoPickResource from './autoPickResource';

interface AutoPickCreep extends Creep {
  cache: AutoPickCache
}

interface AutoPickCache extends CreepCache {
  pick_pos?: string
}

export default profiler.registerFN(function autoPick(creep: AutoPickCreep) {
  return autoPickResource(creep, RESOURCE_ENERGY)
}, 'autoPickRoutine')
