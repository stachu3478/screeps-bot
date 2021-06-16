declare module 'screeps-utf15' {
  interface CodecProperties<T> {
    depth: T extends 1 ? number[] : number
    array: T & (1 | undefined)
  }

  class Codec<T> {
    constructor(codecProperties: CodecProperties<T>)

    encode(values: T extends 1 ? number[] : number): string
    decode(value: string): T extends 1 ? number[] : number
  }
}
