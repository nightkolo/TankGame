class Game {
  static healthFactor = 20.0;

  static EnemyTypes = { // CactiTypes
    NORMAL: 0, // Rogo Cactus
    SHOOTER: 1, // Shoto Cactus
    BOUNCER: 2,
    REFLECTOR: 3,
    SPLITTER: 4,
    EXPLODER: 5, // Exo Cactus
    SPRINTER: 6, // Sprint Cactus
    SPLITTED: 99
  };

  static Items = { // RockItems
    TWO_AXIS_SHOOTING: 0,
    VARIABLE_SHOOTING: 1,
    SLOWNESS: 2,
    SPIKE_SPRINKER: 3
  }

  static getItemName(value) {
    return Object.keys(this.Items).find(key => this.Items[key] === value);
  }

  static getEnemySpikesSpeed(isSlow = false){
    if (isSlow){
      return 2.6 / 4.0;
    } else {
      return 2.6;
    }
  }

  static removeObject(objs, obj) {
    const index = objs.indexOf(obj);
    if (index > -1) {
      objs.splice(index, 1);
    }
  }

  static pickRandomIndex(from, to, set) {
    // Stop when all items have been chosen
    let setEntered = set;
    let lengthToCheck = 0;

    while (setEntered >= 0){
      lengthToCheck += from[setEntered].length;
      setEntered--;
    }

    if (to.length == lengthToCheck) {
      return null;
    }

    let item;
    do {
      const randomIndex = Math.floor(Math.random() * from[set].length);
      item = from[set][randomIndex];
    } while (to.includes(item)); // keep picking until unique
    return item;
  }

  // type: Enemy Type (can be randomized encounter)
  // count: quantity of the Enemy
  // hp: Random health point around interval


  // TODO: Make wave more randomized to add some unpredictability and engagement
  // Make EnemyEncounters

  // TODO pick a random type to include from the 1st set of enemies for each wave
  static enemyEncounter = [
    [ // 1st Encounter
      this.EnemyTypes.NORMAL,
      this.EnemyTypes.SHOOTER,
      this.EnemyTypes.BOUNCER
    ],
    [ // 2nd Encounter
      this.EnemyTypes.SPLITTER,
      this.EnemyTypes.REFLECTOR
    ],
    [ // 3rd Encounter
      this.EnemyTypes.EXPLODER,
      this.EnemyTypes.SPRINTER
    ],
  ]

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

// deprecated
// function spawnWaveEnemies(onWave = wave) {
//   // experimental
//   const waveEnemies = Game.wave[onWave - 1];

//   if (waveEnemies == undefined) {
//     gameOver = true;
//     return;
//   }

//   for (let i = 0; i < waveEnemies.length; i++) {
//     let healthRange = waveEnemies[i].hp[1] - waveEnemies[i].hp[0];
//     let enemySpawns =
//       waveEnemies[i].count[0] +
//       floor(random() * (waveEnemies[i].count[1] - waveEnemies[i].count[0]));

//     let enemyType;

//     if (typeof waveEnemies[i].type == "object") {
//       enemyType =
//         waveEnemies[i].type[floor(waveEnemies[i].type.length * random())];
//     } else {
//       enemyType = waveEnemies[i].type;
//     }

//     for (let j = 0; j < enemySpawns; j++) {
//       let spawnX = random() * width;
//       let spawnY = random() * height;

//       let randomHealth = waveEnemies[i].hp[0] + floor(random() * healthRange);

//       let newEnemy = new Enemy({
//         x: spawnX,
//         y: spawnY,
//         health: randomHealth,
//         player: p,
//         type: enemyType,
//       });

//       enemies.push(newEnemy);
//     }
//   }
// }

// function spawnRandomEnemies() {
//   let healthMin = 3;
//   let healthFactor = 20.0;
//   let enemySpawnsMin = 3;
//   let enemySpawnsFactor = 3;

//   let noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);

//   for (let i = 0; i < noOfEnemies; i++) {
//     let spawnX = random() * width;
//     let spawnY = random() * height;
//     let health = healthMin + floor(random() * healthFactor);

//     const types = Object.values(Game.EnemyTypes);
//     const randomType = random(types);

//     let newEnemy = new Enemy({
//       x: spawnX,
//       y: spawnY,
//       health: health,
//       player: p,
//       bulletDir: curBulletDir,
//       type: randomType,
//     });

//     enemies.push(newEnemy);
//   }
// }