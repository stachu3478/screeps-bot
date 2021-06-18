import _ from 'lodash'
import MyRooms from 'room/MyRooms'

export const VERSION = 1
export default function runMigration() {
  Memory.sources = {}
  MyRooms.get().forEach((room) => {
    room.memory.r = []
    room.memory.remoteRoads = ''
  })
}
