import PlannerMatrix from "./matrix";

export default function planLabs(room: Room) { // TODO finish
  if (!room.controller) return
  const terrain = room.getTerrain()
  const pm = new PlannerMatrix(terrain)
  pm.coverBorder()

}
