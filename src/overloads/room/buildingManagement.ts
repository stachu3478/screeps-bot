import xyToChar from "planner/pos";
import _ from 'lodash'

Room.prototype.addBuilding = function (x: number, y: number, order?: number) {
  const char = String.fromCharCode(xyToChar(x, y))
  const structs = this.memory.structs || ''
  if (structs.indexOf(char) !== -1) return
  const pos = (_.isUndefined(order) ? structs.length : order) as number
  if (pos > structs.length) return
  else if (pos === structs.length) this.memory.structs = structs + char
  else this.memory.structs = structs.replace(structs[pos], char + structs[pos])
}

Room.prototype.removeBuilding = function (x: number, y: number) {
  const char = String.fromCharCode(xyToChar(x, y))
  const structs = this.memory.structs || ''
  this.memory.structs = structs.replace(char, '')
}

Room.prototype.setBuilding = function (x: number, y: number, order: number) {
  const char = String.fromCharCode(xyToChar(x, y))
  const structs = this.memory.structs || ''
  if (structs.indexOf(char) !== -1) return
  this.memory.structs = structs.replace(structs[order], char)
}

Room.prototype.setBuildingOrder = function (x: number, y: number, order: number) {
  const char = String.fromCharCode(xyToChar(x, y))
  const structs = this.memory.structs || ''
  const charPos = structs.indexOf(char)
  const charToReplace = structs[order]
  if (charPos === -1 || !structs[order]) return
  if (char === structs[order]) return
  this.memory.structs = structs.replace(char, '').replace(charToReplace, charPos < order ? charToReplace + char : char + charToReplace)
}

Room.prototype.moveBuilding = function (x1: number, y1: number, x2: number, y2: number) {
  const char1 = String.fromCharCode(xyToChar(x1, y1))
  const char2 = String.fromCharCode(xyToChar(x2, y2))
  const structs = this.memory.structs || ''
  if (structs.indexOf(char2) !== -1) return
  this.memory.structs = structs.replace(char1, char2)
}
