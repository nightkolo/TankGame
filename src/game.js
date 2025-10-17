class Game {
  static EnemyTypes = {
    NORMAL: 0,
    SHOOTER: 1,
    EXPLODER: 2,
    SPRINTER: 3,
    REFLECTOR: 4,
  };
  // type: Enemy Type (can be randomized encounter)
  // count: quantity of the Enemy
  // hp: Random health point around interval

  static waves = [ // Pre-defined Waves
    [
      // 1
      { type: this.EnemyTypes.NORMAL, count: [3, 4], hp: [6, 9] },
    ],
    [
      // 2
      { type: this.EnemyTypes.NORMAL, count: [3, 4], hp: [8, 14] },
      { type: this.EnemyTypes.SHOOTER, count: [1, 1], hp: [6, 9] }
    ],
    [
      // 3
      { type: this.EnemyTypes.NORMAL, count: [4, 5], hp: [8, 10] },
      { type: [this.EnemyTypes.SHOOTER, this.EnemyTypes.REFLECTOR], count: [2, 2], hp: [9, 12] }
    ],
    [
      // 4
      { type: this.EnemyTypes.NORMAL, count: [1, 1], hp: [10, 18] },
      { type: this.EnemyTypes.REFLECTOR, count: [2, 3], hp: [20, 25] }
    ],
    [
      // 5
      { type: this.EnemyTypes.SHOOTER, count: [2, 3], hp: [12, 18] }
    ],
    [
      // 6
      { type: this.EnemyTypes.EXPLODER, count: [1, 2], hp: [5, 18] },
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [10, 18] }
    ],
    [
      // 7
      { type: this.EnemyTypes.EXPLODER, count: [2, 2], hp: [5, 8] },
      { type: this.EnemyTypes.REFLECTOR, count: [1, 2], hp: [10, 18] },
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [10, 18] }
    ],
  ];
}
