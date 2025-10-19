class Game {
  static EnemyTypes = {
    NORMAL: 0,
    SHOOTER: 1,
    EXPLODER: 2,
    SPRINTER: 3,
    REFLECTOR: 4,
    SPLITTER: 5
  };
  static Items = {
    EXTRA_HP: 0,
    TWO_AXIS_SHOOTING: 1
  }
  // type: Enemy Type (can be randomized encounter)
  // count: quantity of the Enemy
  // hp: Random health point around interval


  // TODO: Needs refactor
  static waves = [ // Experimental: Pre-defined Waves
    [
      // 1
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [6, 12] },
    ],
    [
      // 2
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [8, 14] },
      { type: [this.EnemyTypes.SHOOTER, this.EnemyTypes.REFLECTOR], count: [1, 2], hp: [8, 10] }
    ],
    [
      // 3
      { type: this.EnemyTypes.NORMAL, count: [3, 4], hp: [8, 10] },
      { type: this.EnemyTypes.SHOOTER, count: [2, 2], hp: [9, 12] }
    ],
    [
      // 4
      { type: this.EnemyTypes.NORMAL, count: [1, 1], hp: [10, 18] },
      { type: this.EnemyTypes.REFLECTOR, count: [2, 3], hp: [8, 12] }
    ],
    [
      // 5
      { type: [this.EnemyTypes.SHOOTER, this.EnemyTypes.EXPLODER], count: [2, 3], hp: [12, 15] }
    ],
    [
      // 6
      { type: this.EnemyTypes.EXPLODER, count: [1, 2], hp: [12, 20] },
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [10, 18] }
    ],
    [
      // 7
      { type: [this.EnemyTypes.EXPLODER, this.EnemyTypes.SHOOTER], count: [1, 2], hp: [6, 12] },
      { type: this.EnemyTypes.REFLECTOR, count: [2, 2], hp: [10, 18] },
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [10, 18] }
    ],
    [
      // 8
      { type: this.EnemyTypes.REFLECTOR, count: [3, 4], hp: [16, 22] },
      { type: [this.EnemyTypes.NORMAL, this.EnemyTypes.SHOOTER], count: [2, 2], hp: [8, 10] }
    ],
    [
      // 9
      { type: [this.EnemyTypes.REFLECTOR, this.EnemyTypes.SPRINTER], count: [1, 1], hp: [10, 15] },
      { type: this.EnemyTypes.NORMAL, count: [4, 5], hp: [5, 10] }
    ],
    [
      // 10
      { type: this.EnemyTypes.SPRINTER, count: [2, 3], hp: [10, 18] },
      { type: this.EnemyTypes.REFLECTOR, count: [1, 2], hp: [10, 16] },
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [6, 13] }
    ],
    [
      // 11
      { type: [this.EnemyTypes.EXPLODER, this.EnemyTypes.SHOOTER], count: [3, 4], hp: [12, 24] },
      { type: this.EnemyTypes.NORMAL, count: [2, 3], hp: [6, 13] }
    ],
    [
      // 12
      { type: this.EnemyTypes.EXPLODER, count: [1, 2], hp: [6, 10] },
      { type: [this.EnemyTypes.NORMAL, this.EnemyTypes.REFLECTOR], count: [3, 4], hp: [6, 13] }
    ],
    [
      // 13
      { type: this.EnemyTypes.SPRINTER, count: [2, 3], hp: [10, 10] },
      { type: this.EnemyTypes.SHOOTER, count: [1, 1], hp: [15, 25] },
      { type: this.EnemyTypes.NORMAL, count: [0, 3], hp: [6, 12] }
    ],
    [
      // 14
      { type: this.EnemyTypes.EXPLODER, count: [2, 4], hp: [15, 25] },
      { type: this.EnemyTypes.REFLECTOR, count: [3, 5], hp: [15, 25] }
    ],
  ];
}
