import WallPlacer from './wall'
import { SUCCESS, NOTHING_TODO } from 'constants/response'
import ShieldPlacer from './shield'

export default function placeFortification(controller: StructureController) {
  const shieldPlacer = new ShieldPlacer(controller)
  if (shieldPlacer.create()) return SUCCESS

  const wallPlacer = new WallPlacer(controller)
  if (wallPlacer.create()) return SUCCESS

  return NOTHING_TODO
}
