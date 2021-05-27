import _ from 'lodash'

const myStructure = _.find(Game.spawns) || _.find(Game.creeps)
export default myStructure ? myStructure.owner.username : ''
