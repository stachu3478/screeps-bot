import { MINER } from "constants/role";

export default function collectGarbage(mem: CreepMemory, name: string) {
  const roomCreeps = Memory.rooms[mem.room].creeps
  if (roomCreeps) delete roomCreeps[name]
  delete Memory.creeps[name]
}
