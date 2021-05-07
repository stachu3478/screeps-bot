const enum Keys {
  mandatory = 'm',
  drawSource = 'd',
  fillTarget = 'f',
  fillType = 't',
  resourceRoute = 's',
  dumping = 'D',
  buildTarget = 'b',
  buildingRoute = 'c',
  repairTarget = 'r',
}

const enum RoomMemoryKeys {
  shields = 's',
  defenceHoldingTicks = 'd',
  defenceHoldingTimer = 'D',
  ekhaust = 'e',
}

const enum ShardMemoryKeys {
  ownedRooms = 'r',
  roomLimit = 'R',
  creeps = 'c',
}

const enum LabBoostDataKeys {
  resourceType,
  amount,
}

const enum CreepBoostDataKeys {
  name,
  resourceType,
  amount,
  mandatory,
}
