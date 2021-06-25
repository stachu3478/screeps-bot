import _ from 'lodash'

export const VERSION = 2
export default function runMigration() {
  _.forEach(Memory.rooms, (roomMemory) => {
    delete roomMemory.remoteRoads
  })
}
