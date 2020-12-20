import _ from 'lodash'

const attackBodyParts = { [ATTACK]: 1, [RANGED_ATTACK]: 1 }
export const findActiveAttackBodyPart = (hp: number, body: Creep['body']) => {
  const size = body.length
  return !_.isUndefined(
    body.find(
      (bodypart, i) =>
        bodypart.type in attackBodyParts && hp - (size - i) * 100 > -100,
    ),
  )
}
