class BoostManagement {
  private room: Room
  private memory: BoostData

  constructor(room: Room) {
    this.room = room
    this.memory = room.memory.boosts || (room.memory.boosts = {
      creeps: [],
      resources: {
        labs: [],
        creeps: [],
      },
      amounts: {
        labs: [],
        creeps: []
      }
    })
  }
}
