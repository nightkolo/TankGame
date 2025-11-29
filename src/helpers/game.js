let CSinterval;
let dazzleInterval;
let inaccuracyInterval;
let bestWave = 0;

// const itemNames = {};

class Game {
  static enemyHealthFactor = 20.0;
  static tankBuddyLifetime = 8.0;
  static defaultEnemySpeed = 1.35;
  static powerupTime = 8.0;
  static bombDropped = false;
  static bombX = 0.0;
  static bombY = 0.0;
  static critHitProb = 10;
  static critHitX;
  static critHitY;
  static critHitScaleX;
  static critHitScaleY;
  static lastEnemyTypeHit;

  static critHitEvent(x, y){
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

  static dropBomb(x, y){
    this.bombDropped = true;
    this.bombX = x;
    this.bombY = y;
  }

  static setGame(){
    clearInterval(inaccuracyInterval);
    clearInterval(dazzleInterval);
    clearInterval(CSinterval);

    this.itemTimes = new Map([
      ["Counter-Spike", 0.0],
      ["Inaccuracy", 0.0],
      ["Dazzle", 0.0],
      ["Tank Buddy", 0] // Activatable
    ]);

    this.itemStats = new Map([
      ["Counter-Spike", 0],
      ["Inaccuracy", 0],
      ["Dazzle", 0],
      ["Tank Buddy", 0],
      ["Bomb", 0] // Instant
    ])
  }

  static EnemyTypes = { 
    NORMAL: 0, 
    SHOOTER: 1, 
    BOUNCER: 2, // RABBITBALL
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
    [205, 105, 255],
    [255, 255, 105]
  ];

  static getWaveCol(wave){ // experimental
    return this.bgCols[floor(wave / 10.0)];
  }

  static enemiesDefeated = 0;
  static itemStats;

  static itemCollected(item){
    let name = item.name;

    this.itemStats.set(name, this.itemStats.get(name) + 1);

    print(this.itemStats);
  }

  static itemTimes;

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
}