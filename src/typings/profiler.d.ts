declare module 'screeps-profiler' {
  export function enable(): void
  export function registerFN<T>(fn: T, name?: string): T
  export function wrap(fn: () => void): void
}
