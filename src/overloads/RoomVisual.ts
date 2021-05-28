export const infoStyle: TextStyle = {
  align: 'left',
  font: '0.7 Consolas',
  color: '#ffffff',
}
export const dangerStyle: TextStyle = {
  align: 'left',
  font: '0.7 Consolas',
  color: '#ee1111',
}

RoomVisual.prototype.info = function (text, x, y) {
  this.text(text, x, y, infoStyle)
}

RoomVisual.prototype.danger = function (text, x, y) {
  this.text(text, x, y, dangerStyle)
}
