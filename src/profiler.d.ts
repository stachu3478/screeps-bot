declare module 'screeps-profiler' {
  export function enable(): void
  export function wrap(fn: () => void): void
}
