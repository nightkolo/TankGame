class Game {
  static enemyHealthFactor = 20.0;
  static tankBuddyLifetime = 8.0;
  static defaultEnemySpeed = 1.35;

  static EnemyTypes = { 
    NORMAL: 0, 
    SHOOTER: 1, 
    BOUNCER: 2,
    REFLECTOR: 3,
    SPLITTER: 4,
    EXPLODER: 5, 
    SPRINTER: 6, 
    SPLITTED: 99
  };

  static Items = {
    TWO_AXIS_SHOOTING: 0,
    INACCURACY: 1,
    SLOWNESS: 2,
    TANK_BUDDY: 3 // Removed in sketch.js
  }

  static bgCols = [
    [255, 255, 155],
    [185, 185, 255],
    [255, 155, 185],
    [205, 105, 255],
    [255, 255, 105]
  ]

  static getWaveCol(wave){
    return floor(wave / 10.0);
  }

  // TODO utilize Maps
  static itemTimes2 = new Map([
    ["Counter-Spike", 0.0],
    ["Inaccuracy", 0.0],
    ["Dazzle", 0.0],
    ["Tank Buddy", 0.0],
  ]);

  static itemTimes = [
    0.0, // TWO_AXIS_SHOOTING
    0.0, // INACCURACY
    0.0, // SLOWNESS
    0.0 // TANK_BUDDY
  ];

  static prepareItemTimer(itemType, duration = 8.0){
    this.itemTimes2.set(this.getItemName(itemType, false), duration);
  }

  static startItemTimer(itemType, duration){
    const start = millis();
    const dur = duration * 1000.0;

    const interval = setInterval(() => {
      const timeElapsed = millis() - start;
      const remaining = Math.max(0, (dur - timeElapsed));

      const cooldownTimer = remaining / 1000
      
      this.itemTimes[itemType] = cooldownTimer;
      this.itemTimes2.set(this.getItemName(itemType, false), cooldownTimer);

      // print(`Item ${Game.getItemName(itemType)} expires in ${cooldownTimer.toFixed(1)}s`);

      if (remaining <= 0.0) {
        this.itemTimes[itemType] = 0.0;
        clearInterval(interval)
      };
    }, 100);
    // setInterval(callbackFunction, delayInMilliseconds)
    // clearInterval(intervalID)
  }
  // TODO make unique item timers for each item.
  static getItemName(value, codeName = false) {
    let name = "";

    if (codeName){
      switch (value){
        case this.Items.TWO_AXIS_SHOOTING:
          name = "TWO_AXIS_SHOOTING"
          break;
        case this.Items.INACCURACY:
          name = "INACCURACY"
          break;
        case this.Items.SLOWNESS:
          name = "SLOWNESS"
          break;
        case this.Items.TANK_BUDDY:
          name = "TANK_BUDDY"
          break;
      }
    } else {
      switch (value){
        case this.Items.TWO_AXIS_SHOOTING:
          name = "Counter-Spike"
          break;
        case this.Items.INACCURACY:
          name = "Inaccuracy"
          break;
        case this.Items.SLOWNESS:
          name = "Dazzle"
          break;
        case this.Items.TANK_BUDDY:
          name = "Tank Buddy"
          break;
      }
    }
    
    return name;
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