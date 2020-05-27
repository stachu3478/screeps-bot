export default function checkIntegrity(structs: string, labs: string) {
  let newStructs = ''
  structs.split('').forEach(char => {
    if (!structs.includes(char)) newStructs += char
  })
  return newStructs
}
