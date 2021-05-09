declare class EnemiesPlanner {
  isEnemy(username: string): boolean
  isLoaded: boolean
  static instance: EnemiesPlanner
}
