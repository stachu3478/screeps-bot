export default function checkIntegrity(structs: string, labs: string) {
  let newStructs = ''
  structs.split('').forEach((char) => {
    if (!labs.includes(char)) newStructs += char
  })
  return newStructs
}
