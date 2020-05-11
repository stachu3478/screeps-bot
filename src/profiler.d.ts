declare type AnyFunction = (...args: any[]) => any

declare module 'screeps-profiler' {
  export function enable(): void
  export function registerFN(fn: AnyFunction, name?: string): AnyFunction
  export function wrap(fn: () => void): void
}
