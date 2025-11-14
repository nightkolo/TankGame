const canSize = { x: 900, y: 720 }; // 5:4

// Objects
let p;
let e1;
let playerBullets = []; // playerBullets
let enemyBullets = []; // enemyBullets
let buddyBullets = [];
let tankBuddies = [];
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

let bgCol = Game.bgCols[0];

let lastSpawnTime = 0.0;
let shootingSpdFactor = 0.045;

function handleEnemyBullets(bullet) {
  if (!bullet.alive) {
    Game.removeObject(enemyBullets, bullet);
  }

  bullet.spd = Game.getEnemyBulletsSpeed(slowMode);

  if (!p.invincible && GameMath.circleCollision(bullet.x, bullet.y, bullet.size / 2.0, p.x, p.y, p.size / 2.0)) {
    p.hit();
    Game.removeObject(enemyBullets, bullet);
  }

  bullet.update();
  bullet.show();
}

function handlePlayerBullets(bullet) {
  let removeBullet = false;

  // Enemy detection
  enemies.forEach((e) => {
    if (GameMath.circleCollision(e.x, e.y, e.size / 2.0, bullet.x, bullet.y, bullet.size / 2.0)) {
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
  var sfx;

  // Audio
  switch (targetEnemy.type){
    case Game.EnemyTypes.SHOOTER:
      sfx = enemyHitSFXs[floor(random(enemyHitSFXs.length))];
      break;
    // case Game.EnemyTypes.BOUNCER:
    //   sfx = enemyHitCuteSFXs[floor(random(enemyHitCuteSFXs.length))];
    //   break;
    default:
      sfx = enemyHitNormalSFXs[floor(random(enemyHitNormalSFXs.length))];
      break;
  }
  
  sfx.stereo(map(targetEnemy.x, 0, width, -1, 1)).play();
  sfx.play();
  //

  let removeBullet = false;

  if (bullet.hasBeenReflected) {
    targetEnemy.hit(bullet.dirX, bullet.dirY, 2);
  } else {
    targetEnemy.hit(bullet.dirX, bullet.dirY);
  }

  targetEnemy.animBounce();

  if (targetEnemy.hasDied()) {
    let scoreGained = targetEnemy.points;
    
    animScreenShake(targetEnemy.points*1.5, targetEnemy.points*2.0);

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

    // enemyDeadSFX.rate(2.0 - (enemies.length / waveEnemyCount));
    enemyDeadSFX.play();
  }

  if (targetEnemy.type == Game.EnemyTypes.REFLECTOR) {
    bullet.reflect();
  } else {
    removeBullet = true;
  }

  return removeBullet;
}

function handleTankBuddies(buddy){
    if (buddy.spawnBullets()) {
      let spd = 10.0;

      buddyBullets.push(new Bullet(buddy.x, buddy.y, 0, -1, spd));
      buddyBullets.push(new Bullet(buddy.x, buddy.y, 0, 1, spd));
      buddyBullets.push(new Bullet(buddy.x, buddy.y, -1, 0, spd));
      buddyBullets.push(new Bullet(buddy.x, buddy.y, 1, 0, spd));
    }

    buddy.update();
    buddy.show();

    return buddy.alive;
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

let waveEnemyCount = 1;

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
  let enemySpawnsMin = 2 + floor(wave / 9.0);
  let enemySpawnsFactor = 3 + floor(wave / 9.0);
  let enemySpeed = Game.defaultEnemySpeed + (floor(wave / 2.0) / 10.0);

  // print(enemySpeed);
  
  let noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);
  waveEnemyCount = noOfEnemies;

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
   if (floor((wave + 1) / 10.0) == (wave + 1) / 10.0) {
    next10waveSFX.play(); 
  } else if (p.lives < 2){
    p.criticalHealthSFX.play();
  } else {
    nextwaveSFX.play();
  }

  wave++;
  print(wave);
  animText();

  bgCol = Game.bgCols[Game.getWaveCol(wave)];

  if (random() < 1 / 1) {
    // spawnItem(Game.Items.DAZZLE);
    spawnItem();

  }
  // let value = Game.EnemyTypes.SPLITTER;

  // spawnEnemy(value);
  spawnRandomWaveEnemies();
}


// Img
let bgIMG;

function preload() {
  bgIMG = loadImage("img/bg-main-03.png");
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
    bulletDir: curBulletDir,
  });
  enemies.push(e1);
}

function draw() {
  background(bgCol[0], bgCol[1], bgCol[2]);

  if (screenShake) {
    let shakeX = random(-shakeIntensity, shakeIntensity);
    let shakeY = random(-shakeIntensity, shakeIntensity);
    translate(shakeX, shakeY);

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

  tint(bgCol[0], bgCol[1], bgCol[2]);
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

  // Spawn playerBullets
  if (isShooting && !noShoot && !gameOver) {
    if (millis() - lastSpawnTime > shootingSpdFactor * 1000.0) {
      let size = 12.5;
      let extraX = 0.0;
      let extraY = 0.0;

      if (p.powerups.includes(Game.Items.INACCURACY)){
        extraX = (random() * 0.5) - 0.25;
        extraY = (random() * 0.5) - 0.25;
        shootingSpdFactor = 0.045 / 1.25;
      } else {
        shootingSpdFactor = 0.045;
      }

      playerBullets.push(
        new Bullet(p.x, p.y, curBulletDir.x + extraX, curBulletDir.y + extraY, size)
      );
      if (p.powerups.includes(Game.Items.COUNTER_SPIKE)) {
        // TODO make other axis bullets a different fill
        playerBullets.push(
          new Bullet(p.x, p.y, -curBulletDir.x + extraX, -curBulletDir.y + extraY, size)
        );
      }
      lastSpawnTime = millis();
    }
  }
  
  // Handle tankBuddies
  tankBuddies = tankBuddies.filter(handleTankBuddies);

  // Handle buddyBullets
  buddyBullets = buddyBullets.filter((b) => {
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

  stroke(0);
  strokeWeight(5);

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

  // Handle Text
  push();
  translate(width / 4.75, height / 1.1);
  stroke(50);
  rotate((PI / 28.0) * sin(millis() / 360.0));

  textAlign(CENTER);
  textSize(50);
  strokeWeight(8);
  if (animatingBounce) {
    tBounce += 0.012;
    let eased = Anim.elasticEaseOut(constrain(tBounce, 0, 1));
    let x = lerp(1.5, 1, eased);
    let y = lerp(0.5, 1, eased);

    scale([x, y]);
    if (tBounce >= 1) animatingBounce = false;
  } else {
    scale([1, 1]);
  }
  
  text(`Wave ${wave}`, 0, 0);
  
  pop();

  if (wave === 0) {
    strokeWeight(3);
    textSize(30);
    textStyle(BOLD);
    text("A Demo by Night Kolo", width / 2, 100);
    text("WIP", width / 2, 140);
  }

  // Item interface
  textSize(25);
  textAlign(CENTER);

  // Obtain only active times from itemTimes Map
  let activeTimes = Array.from(Game.itemTimes.entries()).filter(([key, value]) => {
    return value !== 0.0;
  });

  for (let i = 0; i < activeTimes.length; i++){
    // print(activeTimes[i][0], activeTimes[i][1]);

    let itemHeld = activeTimes[i][0];
    let timeRemaining;

    if (itemHeld === "Tank Buddy"){
      timeRemaining = `${activeTimes[i][1]} (Click to Release)`;
    } else {
      timeRemaining = activeTimes[i][1].toFixed(2);
    }

    text(`${itemHeld}: ${timeRemaining}`, width / 2.0, height - 30.0 - (35.0 * (i + 1)));
  }
  //

  strokeWeight(5);

  // Handle enemyBullets
  enemyBullets.forEach(handleEnemyBullets);

  // Handle playerBullets
  playerBullets = playerBullets.filter(handlePlayerBullets);

  // Handle Player
  if (p.alive) {
    p.enemies = enemies;
    p.curBulletDir = curBulletDir;

    noShoot = p.insideAnEnemy(false);
    slowMode = p.powerups.includes(Game.Items.DAZZLE);

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
  if (p.powerups.includes(Game.Items.TANK_BUDDY)){
    if (p.tankBuddiesOwned >= 1){
      p.tankBuddiesOwned--;
      Game.setItemTimer(Game.Items.TANK_BUDDY, p.tankBuddiesOwned);
    }

    let s = new TankBuddy(p.x, p.y, shootingSpdFactor * 2.0);
    tankBuddies.push(s);

    Game.removeObject(p.powerups, Game.Items.TANK_BUDDY);

    // Game.startItemTimer(Game.Items.TANK_BUDDY, Game.tankBuddyLifetime);

    // print(p.powerups);
  }
}

function mousePressed() {
  placeTankBuddy();

  isShooting = true;
}

let screenShake = false;
let shakeDuration = 0;
let shakeIntensity = 10;

function animScreenShake(shake = 10.0, dur = 5.0){
  screenShake = true;
  shakeDuration = shake; // Shake for 30 frames
  shakeIntensity = dur; // Reset intensity
}

let animatingBounce = false;
let tBounce = 1.0;

function animText(){
  if (tBounce < 0.5) return;

  tBounce = 0;
  animatingBounce = true;
}

function keyPressed(event) {
  if (event.key === "ArrowUp" || event.key.toLowerCase() == "w") {
    curBulletDir.x = 0; curBulletDir.y = -1;
    shootChangeSFX.play();
  } else if (event.key === "ArrowDown" || event.key.toLowerCase() == "s") {
    curBulletDir.x = 0; curBulletDir.y = 1;
    shootChangeSFX.play();
  } else if (event.key === "ArrowLeft" || event.key.toLowerCase() == "a") {
    curBulletDir.x = -1; curBulletDir.y = 0;
    shootChangeSFX.play();
  } else if (event.key === "ArrowRight" || event.key.toLowerCase() == "d") {
    curBulletDir.x = 1; curBulletDir.y = 0;
    shootChangeSFX.play();
  }
}