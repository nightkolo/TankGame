let CSinterval;
let dazzleInterval;
let inaccuracyInterval;
let bestWave = 0;

class Game {
  static Debug = {
    showHitboxes: false
  };

  static ENEMIES_HEALTH_MAX = 20.0;
  static ENEMY_HITBOX_SIZE_DIVISOR = 1.8;
  static ENEMY_BULLETS_HITBOX_SIZE_DIVISOR = 1.8;
  static ENEMY_HURTBOX_SIZE_FACTOR = 1.22;
  
  static ENEMY_SPAWN_TIME = 1.0;
  static TANK_BUDDY_LIFETIME = 8.0;
  static POWERUP_LIFETIME = 8.0;
  
  static CRIT_HIT_PROBABILITY = 10;
  static DEFAULT_ENEMY_SPEED = 1.35;
  
  static GRAV = 9.8;
  static BUBBLE_MESSAGE = "";

  // Object refs
  static currentPlayer;
  static currentEnemies;

  // States
  static isSlowMode = false;
  
  // Data
  static enemiesDefeated = 0;
  static itemStats;
  static itemTimes;
  static noOfMsgs = 22;
  static randomMsgs = [
    ["Shoot me", 35],
    ["Why so round?", 30],
    ["Another whirl?", 30],
    ["Why so square...", 30],
    ["I got no mouth,\nso I won't bite", 25],
    ["zzZZZ...", 30],
    ["Wha- Huh?", 30],
    ["Hold WASD to Shoot!", 28],
    ["Kolo was here...", 30],
    ["Hello there", 30],
    ["Fun fact: This message box is not large enough", 23],
    ["Tip:\nTry stacking Tank Buddies", 25],
    ["Tip:\nHold two keys for\ndiagonal shooting!", 23],
    ["Tip:\nTry stacking powerups\n for cool synergies", 25],
    ["Tip:\nEnemies are predictable...\nLearn their patterns", 25],
    ["Tip:\nBullets that bounce off\nenemies have more hitpoints", 22],
    ["Tip:\n15 is the maximum amount\nof health you can have", 22],
    ["Tip:\nSome enemies explode upon\ndeath, be careful", 22],
    ["Tip:\nDon't eat my\nsandwich", 25],
    [`Tip:\nCritical Hits have a ${this.CRIT_HIT_PROBABILITY}% chance\n of occuring`, 22],
    [`Tip:\nCritical Hits and Item Pickups\nare two ways to gain Hearts`, 22],
    ["Tip:\nSometimes standing still\nhelps", 25],
    ["Tip:\nTake a break", 28],
  ];

  // Helpers
  static allDir = [
    [0, -1], [0, 1], [-1, 0], [1, 0]
  ]

  static setGame(){
    clearInterval(inaccuracyInterval);
    clearInterval(dazzleInterval);
    clearInterval(CSinterval);

    this.BUBBLE_MESSAGE = this.randomMsgs[floor( random() * this.randomMsgs.length )];
    this.itemTimes = new Map([
      [this.Items.COUNTER_SPIKE.name, 0.0],
      [this.Items.INACCURACY.name, 0.0],
      [this.Items.DAZZLE.name, 0.0],
      [this.Items.TANK_BUDDY.name, 0] // Activatable 
    ]);

    this.itemStats = new Map([
      [this.Items.COUNTER_SPIKE.name, 0],
      [this.Items.INACCURACY.name, 0],
      [this.Items.DAZZLE.name, 0],
      [this.Items.TANK_BUDDY.name, 0],
      [this.Items.BOMB.name, 0] // Instant
    ])
  }

  static EnemyTypes = { 
    NORMAL: 0, 
    SHOOTER: 1, 
    RABBITBALL: 2, // RABBITBALL
    REFLECTOR: 3,
    SPLITTER: 4,
    EXPLODER: 5, 
    SPRINTER: 6, 
    SPLITTED: 99
  };
  static ItemType = {
    DEFAULT: 0,
    ACTIVATABLE: 1,
    INSTANT: 2
  }
  static Items = {
    COUNTER_SPIKE: { id: 0, name: "Counter-Spike", type: this.ItemType.DEFAULT },
    INACCURACY: { id: 1, name: "Inaccuracy", type: this.ItemType.DEFAULT },
    DAZZLE: { id: 2, name: "Dazzle", type: this.ItemType.DEFAULT },
    TANK_BUDDY: { id: 3, name: "Tank Buddy", type: this.ItemType.ACTIVATABLE },
    BOMB: { id: 4, name: "Bomb", type: this.ItemType.INSTANT }
  };

  static bgCols = [
    [255, 255, 155],
    [185, 185, 255],
    [255, 155, 185],
    [255, 125, 125],
    [205, 105, 255]
  ];

  static enemyEncounter = [
    [ // 1st Encounter
      this.EnemyTypes.NORMAL,
      this.EnemyTypes.SHOOTER,
      this.EnemyTypes.RABBITBALL
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

  static getWaveCol(wave){ // experimental
    return this.bgCols[min(4 , floor(wave / 10.0))];
  }

  static itemCollected(item){
    let name = item.name;

    this.itemStats.set(name, this.itemStats.get(name) + 1);

    print(this.itemStats);
  }

  static setItemTimer(itemType, value){ // set by Player
    if (itemType == this.Items.BOMB) return;

    this.itemTimes.set(itemType.name, value);
  }

  static startItemTimer(itemType, duration){ // set by Player
    const start = millis();
    const dur = duration * 1000.0;

    switch (itemType){
      case Game.Items.DAZZLE:
        clearInterval(dazzleInterval);

        dazzleInterval = setInterval(() => {
          Game.intervalTimer(start, dur, Game.Items.DAZZLE);
          }, 100);
        break;
      case Game.Items.COUNTER_SPIKE:
        clearInterval(CSinterval);

        CSinterval = setInterval(() => {
          Game.intervalTimer(start, dur, Game.Items.COUNTER_SPIKE);
          }, 100);
        break;
      case Game.Items.INACCURACY:
        clearInterval(inaccuracyInterval);

        inaccuracyInterval = setInterval(() => {
          Game.intervalTimer(start, dur, Game.Items.INACCURACY);
          }, 100);
        break;
    }
  }

  static intervalTimer(start, dur, type){
    const timeElapsed = millis() - start;
    const remaining = Math.max(0, (dur - timeElapsed));

    const cooldownTimer = remaining / 1000
    
    this.itemTimes.set(type.name, cooldownTimer);
  }

  static getEnemyBulletsSpeed(isSlow = false){
    return (isSlow) ? 2.6 / 4.0 : 2.6;
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

  // Bomb item
  static bombDropped = false;
  static bombX = 0.0;
  static bombY = 0.0;

  static dropBomb(x, y){
    this.bombDropped = true;
    this.bombX = x;
    this.bombY = y;
  }

  // Crit Hit
  static critHitX;
  static critHitY;
  static critHitScaleX;
  static critHitScaleY;

  static critHitEvent(x, y){
    critHitSFX.play();

    this.critHitX = x;
    this.critHitY = y;
    if (random() < 1/2){
      this.critHitScaleY = 2.0;
      this.critHitScaleX = 0.25;
    } else {
      this.critHitScaleX = 2.0;
      this.critHitScaleY = 0.25;
    }
  }

  // Juice
  static lastEnemyTypeHit;
}