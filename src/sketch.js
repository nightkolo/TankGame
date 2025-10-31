const canSize = { x: 900, y: 720 }; // 5:4

// Objects
let p;
let e1;
let playerBullets = []; // playerBullets
let enemyBullets = []; // enemyBullets
let sprinklerBullets = [];
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
let curBulletDir = {
  x: 0,
  y: -1,
};

let lastSpawnTime = 0.0;
let shootingSpdFactor = 0.045;

function handleEnemyBullets(bullet) {
  // handleCactiBullets

  if (!bullet.alive) {
    Game.removeObject(enemyBullets, bullet);
  }

  bullet.spd = Game.getEnemyBulletsSpeed(slowMode);

  if (
    GameMath.circleCollision(bullet.x, bullet.y, bullet.size / 2.0, p.x, p.y, p.size / 2.0)
  ) {
    if (!p.invincible){
      p.hit();
      Game.removeObject(enemyBullets, bullet);
    }
  }

  bullet.update();
  bullet.show();
}

function handlePlayerBullets(bullet) {
  let removeBullet = false;

  // Enemy detection
  enemies.forEach((e) => {
    if (
      GameMath.circleCollision(e.x, e.y, e.size / 2.0, bullet.x, bullet.y, bullet.size / 2.0)
    ) {
      removeBullet = hitEnemy(bullet, e);
    }
  });

  items.forEach((item) => {
    if (!item.opened && GameMath.circleCollision(
        item.x,
        item.y,
        item.size / 2.0,
        bullet.x,
        bullet.y,
        bullet.size / 2.0)
    ) {
      item.hit();
      removeBullet = true;
    }
  });

  bullet.update();
  bullet.show();

  return !removeBullet && !GameMath.offScreen(bullet.x, bullet.y, canSize.x, canSize.y);
}

function hitEnemy(bullet, targetEnemy){
  let removeBullet = false;

  if (bullet.hasBeenReflected) {
    targetEnemy.hit(bullet.dirX, bullet.dirY, 2);
  } else {
    targetEnemy.hit(bullet.dirX, bullet.dirY);
  }

  targetEnemy.animBounce();


  if (targetEnemy.hasDied()) {
    let scoreGained = targetEnemy.points;
    

    switch (targetEnemy.type) {
      case Game.EnemyTypes.EXPLODER:
        let spd = Game.getEnemyBulletsSpeed(slowMode);
        let size = 75.0;

        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, 0, -1, spd, size));
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, 0, 1, spd, size));
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, -1, 0, spd, size));
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, 1, 0, spd, size));
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, -1, -1, spd, size));
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, 1, 1, spd, size));
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, -1, 1, spd, size));
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, 1, -1, spd, size));
        break;

      case Game.EnemyTypes.SPLITTER:
        let lastX = targetEnemy.x;
        let lastY = targetEnemy.y;
        let h = ceil(targetEnemy.getInitialHealth() / 3.0);

        let enemy1 = new Enemy({
          x: lastX + (100 * -bullet.dirY),
          y: lastY + (100 * bullet.dirX),
          health: h,
          type: Game.EnemyTypes.SPLITTED,
          player: p,
        });
        let enemy2 = new Enemy({
          x: lastX - (100 * -bullet.dirY),
          y: lastY - (100 * bullet.dirX),
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
    bullet.reflect();
  } else {
    removeBullet = true;
  }

  return removeBullet;
}

function handleSprinklers(sprnk){
    if (sprnk.spawnBullets()) {
      let spd = 10.0;

      sprinklerBullets.push(new Bullet(sprnk.x, sprnk.y, 0, -1, spd));
      sprinklerBullets.push(new Bullet(sprnk.x, sprnk.y, 0, 1, spd));
      sprinklerBullets.push(new Bullet(sprnk.x, sprnk.y, -1, 0, spd));
      sprinklerBullets.push(new Bullet(sprnk.x, sprnk.y, 1, 0, spd));
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

// Debug
function spawnEnemy(type) {
  let healthMin = 3;
  let enemyHealthFactor = 20.0;

  let thres = 250.0;
  let spawnX = GameMath.randomFloat(200.0, width - 200);
  let spawnY = GameMath.randomFloat(200.0, height - 200);
  let health = healthMin + floor(random() * enemyHealthFactor);

  let newEnemy = new Enemy({
    x: spawnX,
    y: spawnY,
    health: health,
    player: p,
    bulletDir: curBulletDir,
    type: type,
  });

  enemies.push(newEnemy);
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

  let healthMin = 3 + floor(wave / 6.0);
  let enemySpawnsMin = 2 + floor(wave / 8.0);
  let enemySpawnsFactor = 3 + floor(wave / 8.0);
  let enemySpeed = Game.defaultEnemySpeed + (floor(wave / 2.0) / 10.0);

  // print(enemySpeed);
  
  let noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);

  for (let i = 0; i < noOfEnemies; i++) {
    let spawnX = GameMath.randomFloat(120.0, width - 120.0);
    let spawnY = GameMath.randomFloat(120.0, height - 120.0);
    let health = healthMin + floor(random() * Game.enemyHealthFactor);

    // print(`Enemy (${i + 1}): ${round(spawnX)}, ${round(spawnY)}, ${health}`);

    const randomType = currentEnemyTypes[floor(random() * currentEnemyTypes.length)];

    // TODO make the newly added enemy type appear in the wave it is added in

    let newEnemy = new Enemy({
      x: spawnX,
      y: spawnY,
      health: health,
      player: p,
      maxSpeed: enemySpeed,
      bulletDir: curBulletDir,
      type: randomType,
    });

    enemies.push(newEnemy);
  }
}

function gotoNextWave() {
  wave++;
  print(wave);

  if (random() < 1 / 4) {
    spawnItem();
  }
  // let value = Game.EnemyTypes.REFLECTOR;

  // spawnEnemy(value);
  spawnRandomWaveEnemies();
}

let bgIMG;

function preload() {
  bgIMG = loadImage("img/bg-main.png");
}

let screenShake = false;
let shakeDuration = 0;
let shakeIntensity = 10;

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
    bulletDir: curBulletDir,
  });
  enemies.push(e1);
}

function draw() {
  background("#d1d166ff");

  if (screenShake) {
    // Apply a random translation based on intensity
    let shakeX = random(-shakeIntensity, shakeIntensity);
    let shakeY = random(-shakeIntensity, shakeIntensity);
    translate(shakeX, shakeY);

    // Decrease the shake duration over time
    shakeDuration--;
    if (shakeDuration <= 0) {
      screenShake = false;
    }
  }

  // Handle BG
  push();
  translate(width / 2, height / 2);
  rotate(millis() * (1 / 18000));
  imageMode(CENTER);
  tint(255, 255, 155);
  image(bgIMG, 0, 0);
  // image()
  pop();
  // 

  noCursor();
  frameRate(60);
  rectMode(CENTER);

  // Enemies defeated
  if (enemies.length == 0 && !gameOver/* && !enemiesDefeated*/) {
    gotoNextWave();
  }

  // Spawn playerBullets
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

      playerBullets.push(
        new Bullet(p.x, p.y, curBulletDir.x + extraX, curBulletDir.y + extraY, size)
      );
      if (p.powerups.includes(Game.Items.TWO_AXIS_SHOOTING)) {
        // TODO make other axis bullets a different fill
        playerBullets.push(
          new Bullet(p.x, p.y, -curBulletDir.x + extraX, -curBulletDir.y + extraY, size)
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

  textAlign(CENTER);
  textSize(45);
  strokeWeight(7);
  text(`Wave ${wave}`, 0, 0);
  
  pop();

  if (wave === 0) {
    strokeWeight(3);
    textSize(30);
    text("A Demo by Night Kolo", width / 2, 100);
    text("WIP", width / 2, 140);
  }

  // print(Game.itemTimes);

  // for (let i = 0; i < Game.itemTimes.length; i++){
  //   const time = Game.itemTimes[i];

  //   if (time > 0.0){
  //     print(time);
  //   }
  // }

  strokeWeight(5);
  
  // Handle playerBullets
  playerBullets = playerBullets.filter(handlePlayerBullets);
  
  // Handle enemyBullets
  enemyBullets.forEach(handleEnemyBullets);

  // Handle sprinklerBullets
  sprinklerBullets = sprinklerBullets.filter((b) => {
    let removeBullet = false;

    enemies.forEach((e) => {
      if (GameMath.circleCollision(b.x, b.y, b.size / 2.0, e.x, e.y, e.size / 2.0)) {
        removeBullet = hitEnemy(b, e);

        Game.removeObject(enemyBullets, b);
      }
    })

    b.update();
    b.show();

    return !removeBullet && !GameMath.offScreen(b.x, b.y, canSize.x, canSize.y);
  })

  // Handle Enemies
  enemies.forEach((e) => {
    e.slow = slowMode;

    if (e.spawnBullets() && e.canShoot) {
      let spd = Game.getEnemyBulletsSpeed(slowMode);
      let size = 75.0;

      enemyBullets.push(new Bullet(e.x, e.y, 0, -1, spd, size));
      enemyBullets.push(new Bullet(e.x, e.y, 0, 1, spd, size));
      enemyBullets.push(new Bullet(e.x, e.y, -1, 0, spd, size));
      enemyBullets.push(new Bullet(e.x, e.y, 1, 0, spd, size));
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


  // noStroke();

  // Handle Player
  if (p.alive) {
    p.enemies = enemies;
    p.curBulletDir = curBulletDir;

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

function placeTankBuddy(){
  if (p.powerups.includes(Game.Items.SPIKE_SPRINKER)){
    let s = new Sprinker(p.x, p.y, shootingSpdFactor * 2.0);
    sprinklers.push(s);

    Game.removeObject(p.powerups, Game.Items.SPIKE_SPRINKER);

    Game.startItemTimer(Game.Items.SPIKE_SPRINKER, Game.tankBuddyLifetime);

    // print(p.powerups);
  }
}

function mousePressed() {
  placeTankBuddy();

  isShooting = true;
}

function animScreenShake(){
  screenShake = true;
  shakeDuration = 10; // Shake for 30 frames
  shakeIntensity = 5; // Reset intensity
}

function keyPressed(event) {
  if (event.key === "ArrowUp"|| event.key.toLowerCase() == "w") {
    curBulletDir.x = 0; curBulletDir.y = -1;
  } else if ( event.key === "ArrowDown" || event.key.toLowerCase() == "s") {
    curBulletDir.x = 0; curBulletDir.y = 1;
  } else if ( event.key === "ArrowLeft" || event.key.toLowerCase() == "a") {
    curBulletDir.x = -1; curBulletDir.y = 0;
  } else if ( event.key === "ArrowRight" || event.key.toLowerCase() == "d") {
    curBulletDir.x = 1; curBulletDir.y = 0;
  }
}