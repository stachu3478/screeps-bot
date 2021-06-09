import EnemyPicker from 'room/military/EnemyPicker'

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

RoomVisual.prototype.enemy = function (
  enemyPicker: EnemyPicker,
  shouldAttack: boolean,
) {
  const enemy = enemyPicker.enemy
  const currentDmg = enemyPicker.dealt
  const maxDmg = enemyPicker.maxDealable
  const canDeal = enemyPicker.dealt > 0
  this.danger(
    `Enemy tracked: ${enemy?.name} Vulnerability: ${currentDmg} / ${maxDmg} ${shouldAttack} / ${canDeal}`,
    0,
    4,
  )
}

RoomVisual.prototype.spawnsBusy = function () {
  this.info('All spawns busy', 0, 3)
}

RoomVisual.prototype.details = function (room, creepCount, creepCountByRole) {
  const retiredCreeps = creepCountByRole[Role.RETIRED] || 0
  const populationStyle = creepCount === 0 ? dangerStyle : infoStyle
  const energyStyle =
    room.energyCapacityAvailable === 0 ? dangerStyle : infoStyle
  this.text(
    'Population: ' + creepCount + ' Retired: ' + retiredCreeps,
    0,
    0,
    populationStyle,
  )
  this.text(
    'Spawns: ' + room.energyAvailable + '/' + room.energyCapacityAvailable,
    0,
    1,
    energyStyle,
  )
}
