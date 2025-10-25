const canSize = { x: 900, y: 720 }; // 5:4

// TODO use modules for multiple js files

// Objects
let p;
let e1;
let playerSpikes = []; // playerSpikes
let enemySpikes = []; // enemySpikes
let sprinklerSpikes = [];
let sprinklers = [];
let enemies = [];
let items = [];
let isShooting = false;

// Game Loop
let wave = 0;
let score = 0;
let gameOver = false;
let currentEnemyTypes = [Game.EnemyTypes.NORMAL];
const enemySetEncounters = [0, 5, 13];

// Items
let slowMode = false;

// Debug
let noShoot = false;
let curSpikeDir = {
  x: 0,
  y: -1,
};

let lastSpawnTime = 0.0;
let shootingSpdFactor = 0.045;

function handleEnemySpikes(spike) {
  // handleCactiSpikes

  if (!spike.alive) {
    Game.removeObject(enemySpikes, spike);
  }

  spike.spd = Game.getEnemySpikesSpeed(slowMode);

  if (
    GameMath.circleCollision(spike.x, spike.y, spike.size / 2.0, p.x, p.y, p.size / 2.0)
  ) {
    if (!p.invincible){
      p.hit();
      Game.removeObject(enemySpikes, spike);
    }
  }

  spike.update();
  spike.show();
}

function handlePlayerSpikes(spike) {
  let removeSpike = false;

  // Enemy detection
  enemies.forEach((e) => {
    if (
      GameMath.circleCollision(e.x, e.y, e.size / 2.0, spike.x, spike.y, spike.size / 2.0)
    ) {
      removeSpike = hitEnemy(spike, e);
    }
  });

  items.forEach((item) => {
    if (!item.opened && GameMath.circleCollision(
        item.x,
        item.y,
        item.size / 2.0,
        spike.x,
        spike.y,
        spike.size / 2.0)
    ) {
      item.hit();
      removeSpike = true;
    }
  });

  spike.update();
  spike.show();

  return !removeSpike && !GameMath.offScreen(spike.x, spike.y, canSize.x, canSize.y);
}

function hitEnemy(spike, targetEnemy){
  let removeSpike = false;

  if (spike.hasBeenReflected) {
    targetEnemy.hit(spike.dirX, spike.dirY, 2);
  } else {
    targetEnemy.hit(spike.dirX, spike.dirY);
  }

  if (targetEnemy.hasDied()) {
    let scoreGained = targetEnemy.points;

    switch (targetEnemy.type) {
      case Game.EnemyTypes.EXPLODER:
        let spd = 4.0;
        let size = 75.0;

        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, 0, -1, spd, size));
        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, 0, 1, spd, size));
        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, -1, 0, spd, size));
        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, 1, 0, spd, size));
        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, -1, -1, spd, size));
        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, 1, 1, spd, size));
        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, -1, 1, spd, size));
        enemySpikes.push(new Spike(targetEnemy.x, targetEnemy.y, 1, -1, spd, size));
        break;

      case Game.EnemyTypes.SPLITTER:
        let lastX = targetEnemy.x;
        let lastY = targetEnemy.y;
        let h = ceil(targetEnemy.initialHealth / 3.0);

        let enemy1 = new Enemy({
          x: lastX + (100 * -spike.dirY),
          y: lastY + (100 * spike.dirX),
          health: h,
          type: Game.EnemyTypes.SPLITTED,
          player: p,
        });
        let enemy2 = new Enemy({
          x: lastX - (100 * -spike.dirY),
          y: lastY - (100 * spike.dirX),
          health: h,
          type: Game.EnemyTypes.SPLITTED,
          player: p,
        });

        enemies.push(enemy1);
        enemies.push(enemy2);
        break;
    }

    Game.removeObject(enemies, targetEnemy);
    score += scoreGained;
  }

  if (targetEnemy.type == Game.EnemyTypes.REFLECTOR) {
    spike.reflect();
  } else {
    removeSpike = true;
  }

  return removeSpike;
}

function handleSprinklers(sprnk){
    if (sprnk.spawnSpikes()) {
      let spd = 10.0;

      sprinklerSpikes.push(new Spike(sprnk.x, sprnk.y, 0, -1, spd));
      sprinklerSpikes.push(new Spike(sprnk.x, sprnk.y, 0, 1, spd));
      sprinklerSpikes.push(new Spike(sprnk.x, sprnk.y, -1, 0, spd));
      sprinklerSpikes.push(new Spike(sprnk.x, sprnk.y, 1, 0, spd));
    }

    sprnk.update();
    sprnk.show();

    return sprnk.alive;
}

function spawnItem(item = -1) {
  let itemToSpawn = 0;

  if (item == -1){
    const types = Object.values(Game.Items);
    itemToSpawn = random(types);
  } else {
    itemToSpawn = item;
  }

  let spawnX = GameMath.randomFloat(200.0, width - 200);
  let spawnY = GameMath.randomFloat(200.0, height - 200);

  let i = new Item(spawnX, spawnY, itemToSpawn, p);

  items.push(i);
}

function spawnRandomWaveEnemies(onWave = wave) {
  let encounterSet = 0;

  if (onWave > enemySetEncounters[0] && onWave <= enemySetEncounters[1]) {
    encounterSet = 0;
  } else if (onWave > enemySetEncounters[1] && onWave <= enemySetEncounters[2]) {
    encounterSet = 1;
  } else {
    encounterSet = 2;
  }

  const randomType = Game.pickRandomIndex(Game.enemyEncounter, currentEnemyTypes, encounterSet);

  if (randomType != null) {
    currentEnemyTypes.push(randomType);
  }

  let healthMin = 3 + floor(wave / 5.0);
  let enemySpawnsMin = 3 + floor(wave / 7.0);
  let enemySpawnsFactor = 3 + floor(wave / 7.0);

  let noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);

  for (let i = 0; i < noOfEnemies; i++) {
    let spawnX = GameMath.randomFloat(120.0, width - 120.0);
    let spawnY = GameMath.randomFloat(120.0, height - 120.0);
    let health = healthMin + floor(random() * Game.healthFactor);

    const randomType = currentEnemyTypes[floor(random() * currentEnemyTypes.length)];

    // TODO make the newly added enemy type appear in the wave it is added in

    let newEnemy = new Enemy({
      x: spawnX,
      y: spawnY,
      health: health,
      player: p,
      bulletDir: curSpikeDir,
      type: randomType,
    });

    enemies.push(newEnemy);
  }
}

function gotoNextWave() {
  wave++;
  print(wave);

  if (random() < 1 / 1) {
    spawnItem(Game.Items.SLOWNESS);
  }
  let value = Game.EnemyTypes.BOUNCER;

  spawnEnemy(value);
  // spawnRandomWaveEnemies();
}

function displayText() {
  textAlign(CENTER);
  textSize(45);
  strokeWeight(7);
  text(`Wave ${wave}`, 0, 0);
}

let bgIMG;

function preload() {
  bgIMG = loadImage("img/bg-main.png");
}

function setup() {
  createCanvas(canSize.x, canSize.y);

  textFont("Nunito");
  textStyle(BOLD);

  p = new Tank();

  e1 = new Enemy({
    x: width / 2,
    y: height / 2,
    health: 10,
    player: p,
    type: Game.EnemyTypes.NORMAL,
    followPlayer: false,
    bulletDir: curSpikeDir,
  });
  enemies.push(e1);
}

function draw() {
  background("#d1d166ff");

  // Handle BG
  push();
  translate(width / 2, height / 2);
  rotate(millis() * (1 / 18000));
  imageMode(CENTER);
  tint(255, 255, 155);
  image(bgIMG, 0, 0);
  pop();
  // 

  noCursor();
  frameRate(60);
  rectMode(CENTER);

  // Enemies defeated
  if (enemies.length == 0 && !gameOver) {
    gotoNextWave();
  }

  // Spawn playerSpikes
  if (isShooting && !noShoot && !gameOver) {
    if (millis() - lastSpawnTime > shootingSpdFactor * 1000.0) {
      let size = 12.5;
      let extraX = 0.0;
      let extraY = 0.0;

      if (p.powerups.includes(Game.Items.VARIABLE_SHOOTING)){
        extraX = (random() * 0.5) - 0.25;
        extraY = (random() * 0.5) - 0.25;
        shootingSpdFactor = 0.045 / 1.25;
      } else {
        shootingSpdFactor = 0.045;
      }

      playerSpikes.push(
        new Spike(p.x, p.y, curSpikeDir.x + extraX, curSpikeDir.y + extraY, size)
      );
      if (p.powerups.includes(Game.Items.TWO_AXIS_SHOOTING)) {
        playerSpikes.push(
          new Spike(p.x, p.y, -curSpikeDir.x + extraX, -curSpikeDir.y + extraY, size)
        );
      }
      lastSpawnTime = millis();
    }
  }

  // Handle Text
  push();
  translate(width / 2, height / 1.1);
  stroke(50);
  rotate((PI / 28.0) * sin(millis() / 360.0));
  displayText();
  pop();

  if (wave === 0) {
    strokeWeight(3);
    textSize(30);
    text("A Demo by Night Kolo", width / 2, 100);
    text("Playtester", width / 2, 140);
  }
  //

  strokeWeight(5);
  
  // Handle playerSpikes
  playerSpikes = playerSpikes.filter(handlePlayerSpikes);
  
  // Handle enemySpikes
  enemySpikes.forEach(handleEnemySpikes);

  // Handle sprinklerSpikes
  sprinklerSpikes = sprinklerSpikes.filter((b) => {
    let removeSpike = false;

    enemies.forEach((e) => {
      if (GameMath.circleCollision(b.x, b.y, b.size / 2.0, e.x, e.y, e.size / 2.0)) {
        removeSpike = hitEnemy(b, e);

        Game.removeObject(enemySpikes, b);
      }
    })

    b.update();
    b.show();

    return !removeSpike && !GameMath.offScreen(b.x, b.y, canSize.x, canSize.y);
  })

  // Handle Enemies
  enemies.forEach((e) => {
    e.slow = slowMode;

    if (e.spawnSpikes() && e.canShoot) {
      let spd = Game.getEnemySpikesSpeed(slowMode);
      let size = 75.0;

      enemySpikes.push(new Spike(e.x, e.y, 0, -1, spd, size));
      enemySpikes.push(new Spike(e.x, e.y, 0, 1, spd, size));
      enemySpikes.push(new Spike(e.x, e.y, -1, 0, spd, size));
      enemySpikes.push(new Spike(e.x, e.y, 1, 0, spd, size));
    }

    e.update();
    e.show();
  });

  // Handle Sprinklers
  sprinklers = sprinklers.filter(handleSprinklers);
  
  // Handle Items
  fill(GRAY);
  items = items.filter((i) => {
    i.enemies = enemies;

    i.update();
    i.show();
    return !i.collected && !GameMath.offScreen(i.x, i.y, canSize.x, canSize.y);
  });
  fill(255);
  //

  // Handle Tank
  if (p.alive) {
    p.enemies = enemies;
    noShoot = p.insideAnEnemy(false);
    slowMode = p.powerups.includes(Game.Items.SLOWNESS);

    if (p.insideAnEnemy()) {
      // TODO add better feedback for player getting hit
      p.hit();
    }

    p.update();
    p.show();
  } else {
    gameOver = true;
  }
}

function mousePressed() {
  if (p.powerups.includes(Game.Items.SPIKE_SPRINKER)){
    let s = new Sprinker(p.x, p.y, shootingSpdFactor * 2.0);
    sprinklers.push(s);

    Game.removeObject(p.powerups, Game.Items.SPIKE_SPRINKER);

    return;
  }
  isShooting = !isShooting;
}

function keyPressed(event) {
  if (event.key === "ArrowUp"|| event.key.toLowerCase() == "w") {
    curSpikeDir.x = 0; curSpikeDir.y = -1;
  } else if ( event.key === "ArrowDown" || event.key.toLowerCase() == "s") {
    curSpikeDir.x = 0; curSpikeDir.y = 1;
  } else if ( event.key === "ArrowLeft" || event.key.toLowerCase() == "a") {
    curSpikeDir.x = -1; curSpikeDir.y = 0;
  } else if ( event.key === "ArrowRight" || event.key.toLowerCase() == "d") {
    curSpikeDir.x = 1; curSpikeDir.y = 0;
  }
}

// Debug
function spawnEnemy(type) {
  let healthMin = 3;
  let healthFactor = 20.0;

  let thres = 250.0;
  let spawnX = GameMath.randomFloat(200.0, width - 200);
  let spawnY = GameMath.randomFloat(200.0, height - 200);
  let health = healthMin + floor(random() * healthFactor);

  let newEnemy = new Enemy({
    x: spawnX,
    y: spawnY,
    health: health,
    player: p,
    bulletDir: curSpikeDir,
    type: type,
  });

  enemies.push(newEnemy);
}