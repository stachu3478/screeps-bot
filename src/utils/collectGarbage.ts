import { MINER } from "constants/role";

export default function collectGarbage(name: string) {
  const mem = Memory.creeps[name]
  if (!mem) return
  const roomCreeps = Memory.rooms[mem.room].creeps
  if (roomCreeps) delete roomCreeps[name]
  delete Memory.creeps[name]
}
