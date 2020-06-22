const partPriorities = [MOVE, WORK, HEAL, RANGED_ATTACK, ATTACK, CARRY, CLAIM]

export default (body: BodyPartConstant[]) => {
  let bodyReplaceIndex = body.length - 1
  partPriorities.forEach(part => {
    const partIndex = body.lastIndexOf(part)
    if (partIndex === -1) return
    if (partIndex === bodyReplaceIndex) return
    body[partIndex] = body[bodyReplaceIndex]
    body[bodyReplaceIndex--] = part
  })
  return body
}
