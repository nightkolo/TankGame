const canSize = { x: 900, y: 720 }; // 5:4

// Objects
let p;
let e1;
let playerBullets = []; 
let enemyBullets = []; 
let buddyBullets = [];
let tankBuddies = [];
let enemies = [];
let items = [];

// Game Loop
let wave = 67; // Why
let score = 0;
let gameOver = false;
let gameStarted = false;
let currentEnemyTypes = [Game.EnemyTypes.NORMAL];
const enemySetEncounters = [0, 5, 13];
let lastSpawnTime = 0.0;
let shootingSpdFactor = 0.045;
let isShooting = false;

// Items
let slowMode = false;

// Debug
let noShoot = false;
let curBulletDir = {
  x: 0,
  y: -1,
};

// Juice
let bgCol = Game.bgCols[0];
let playerTrail = [];

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
    targetEnemy.hit(bullet.dirX, quad.dirY, 2);
  } else {
    targetEnemy.hit(bullet.dirX, bullet.dirY);
  }

  targetEnemy.animBounce();

  enemyDied(targetEnemy, bullet);
  
  if (targetEnemy.type == Game.EnemyTypes.REFLECTOR) {
    bullet.reflect();
  } else {
    removeBullet = true;
  }

  return removeBullet;
}

function enemyDied(targetEnemy, bullet){
  if (targetEnemy.hasDied() == false) return;

  let scoreGained = targetEnemy.points;

  Game.lastEnemyTypeHit = targetEnemy.type;
  Game.enemiesDefeated++;

  animScreenShake(targetEnemy.points*2.5, targetEnemy.points*3.0);

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
  
  let noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);
  waveEnemyCount = noOfEnemies;

  for (let i = 0; i < noOfEnemies; i++) {
    let spawnX = GameMath.randomFloat(120.0, width - 120.0);
    let spawnY = GameMath.randomFloat(120.0, height - 120.0);
    let health = healthMin + floor(random() * Game.enemyHealthFactor);

    // console.log(`Enemy (${i + 1}): ${round(spawnX)}, ${round(spawnY)}, ${health}`);

    const randomType = currentEnemyTypes[floor(random() * currentEnemyTypes.length)];

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

  if (wave > Game.bestWave){
    Game.bestWave = wave;
  }

  bgCol = Game.getWaveCol(wave);

  if (random() < 1 / 1) {
    // spawnItem(Game.Items.TANK_BUDDY);
    spawnItem();

  }
  // let value = Game.EnemyTypes.SPLITTER;

  // spawnEnemy(value);
  spawnRandomWaveEnemies();
}

function gameEnd(){
  gameOver = true;
  gameStarted = false;

  print("Game over!")
  print("== Stats ==");
  print(`Wave reached: ${wave}`);  
  print(`Score: ${score}`);
  print(`Enemies defeated: ${Game.enemiesDefeated}`);
  print(`Items collected: ${Game.itemStats}`);
}

function newGame(){
  enemyBullets = [];
  buddyBullets = [];
  playerBullets = [];
  tankBuddies = [];
  enemies = [];
  items = [];
 
  gameStarted = true;
  gameOver = false;
  isShooting = false;
  currentEnemyTypes = [Game.EnemyTypes.NORMAL];
  lastSpawnTime = 0.0;
  shootingSpdFactor = 0.045;

  Game.setGame();

  wave = 0;

  animText();
  bgCol = Game.getWaveCol(wave);

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

let bgIMG;
let icon;
let iconDazzle;
let iconCS;
let iconBuddy;
let iconInacc;
let panel;
let panel2;
let fonts;

function preload() {
  panel = loadImage('img/panel-01.svg');
  panel2 = loadImage('img/panel-02.svg');

  icon = loadImage('img/power-up-icon-def.svg');
  iconDazzle = loadImage('img/item-icon-dazzle.svg');
  iconCS = loadImage('img/item-icon-counter-spike.svg');
  iconBuddy = loadImage('img/item-icon-tankbuddy.svg');
  iconInacc = loadImage('img/item-icon-inaccuracy-01.svg');
 
  bgIMG = loadImage("img/bg-main-03.png");
  fonts = loadFont("font/Nunito-Bold.ttf");
}

let b;
let gui;

function setup() {
  createCanvas(canSize.x, canSize.y);
  gui = createGui();

  textFont("Nunito");
  textStyle(BOLD);

  b = createButton("Another whirl?", width/2 - 100, height - 200.0, 200, 50);
  b.setStyle({
      fillBg: color("#fbbfbfff"),
      font: fonts,
      rounding: 5,
      textSize: 2,
      textSize: 24,
      // fillBg p5.Color: default background color
      fillBgHover: color("#ffffffff"),
      fillBgActive: color("#000000ff"),
      // fillLabel p5.Color: default label color
      // fillLabelHover p5.Color: hover label color
      fillLabelActive: color("#ffffffff")
      // strokeBg p5.Color: default stroke color
      // strokeBgHover p5.Color: hover stroke color
      // strokeBgActive
  });

  Game.setGame();
  newGame();
}

let bombs = [];

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

  if (bgPulseStart !== null) {
    let t = (millis() - bgPulseStart) / bgPulseDuration;

    if (t >= 1) {
      bgCol = Game.getWaveCol(wave);
      bgPulseStart = null;
    } else {
      bgCol = [
        lerp(bgPulseFrom[0], bgPulseTo[0], t),
        lerp(bgPulseFrom[1], bgPulseTo[1], t),
        lerp(bgPulseFrom[2], bgPulseTo[2], t)
      ];
    }
  }

  tint(bgCol[0], bgCol[1], bgCol[2]);
  image(bgIMG, 0, 0);
  pop();
  // 

  noCursor();
  frameRate(60);
  rectMode(CENTER);

  // Enemies defeated
  if (enemies.length == 0 && !gameOver && gameStarted) {
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
  
  // Handle buddyBullets
  fill(200, 200, 255);
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
  });
  fill(255);

  // Handle tankBuddies
  fill(127, 127, 255);
  tankBuddies = tankBuddies.filter(handleTankBuddies);


  // Handle Enemies
  enemies.forEach((e) => {
    e.slowMode = slowMode;

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

  // Handle Bombs
  if (Game.bombDropped){
    bombs.push(new Bomb(Game.bombX, Game.bombY));
    Game.bombDropped = false;
  }
  bombs = bombs.filter((b) => {
    b.update();
    b.show();

    b.explode(enemies);

    return !b.hasExploded;
  });
  //
  fill(255);

  // Handle Text
  push();
  translate(width / 4.75, height / 1.1);
  stroke(50);
  rotate((PI / 28.0) * sin(millis() / 360.0));

  textAlign(CENTER);
  textSize(50);
  strokeWeight(8);
  if (animatingBounce) {
    tBounce += deltaTime * 0.0006;
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

    text("A Demo by Night Kolo\nMade in p5.js", width / 2, 100);
    text("Tank is Tiny", width/4, (height / 2.0) - 140.0)
    
    strokeWeight(7.5);
    stroke(50);
    image(panel, width/4, height/2);
    text("Shoot", (width / 4), (height / 2.0) + 140.0);
    image(panel2, (width/4) * 3.0, height/2);
  }

  

  // Item interface
  textSize(25);
  textAlign(CENTER);
  strokeWeight(5);
  stroke(50);
  fill(255);

  // Obtain only active times from itemTimes Map
  let activeTimes = Array.from(Game.itemTimes.entries()).filter(([key, value]) => {
    return value !== 0.0;
  });

  for (let i = 0; i < activeTimes.length; i++){
    let itemHeld = activeTimes[i][0];

    const w = width - 120.0 - (120.0 * i);
    const h = height - 100.0;
    
    let timeLeft = activeTimes[i][1];
    let barHeight = 100.0 * (timeLeft / Game.powerupTime);
    
    rectMode(CORNER);
    noStroke();

    let flash = 1;
    if (timeLeft <= 3.0 || itemHeld === "Tank Buddy") {
      flash = map(sin(millis() * 0.015), -1, 1, 0.5, 1);
    }
    fill(255, 255 * flash, 255 * flash);

    rect(
      w - 50.0,
      h - barHeight + 50.0,
      100.0,
      barHeight,
      10.0,
      10.0
    );
    
    rectMode(CENTER);
    stroke(50);
    
    if (itemHeld === "Counter-Spike"){
      image(iconCS, w, h);
    } else if (itemHeld === "Dazzle"){
      image(iconDazzle, w, h);
    } else if (itemHeld === "Tank Buddy"){
      image(iconBuddy, w, h);
      textSize(20);
      text('Click to\nRelease!', w, h - 75.0);
  
      textSize(30);
      text(`${activeTimes[i][1]}`,w + 45.0, h + 45.0);
    } else if (itemHeld === "Inaccuracy"){
      image(iconInacc, w, h);
    }
  }
  //

  strokeWeight(5);
  textSize(25);

  // Handle enemyBullets
  fill(255, 175, 175);
  enemyBullets.forEach(handleEnemyBullets);

  fill(255);
  // Handle playerBullets
  playerBullets = playerBullets.filter(handlePlayerBullets);

  // Critical Hit Anim
  push();
  translate(Game.critHitX, Game.critHitY);
  rotate((PI / 28.0) * sin(millis() / 720.0));

  strokeWeight(10);
  textSize(50);
  textLeading(50);
  stroke(30);
  fill(255, 255, 55);
  if (animatingCritHit) {
    tCritHit += deltaTime * 0.00045;
    let eased = Anim.elasticEaseOut(constrain(tCritHit, 0, 1));
    let x = lerp(Game.critHitScaleX, 1, eased);
    let y = lerp(Game.critHitScaleY, 1, eased);

    // TODO set text color to attacked Enemy color
    fill(255, 255, 55, 255 * (Math.min(1.0, 2.0 - (2.0 * tCritHit))));
    stroke(30, 255 * (Math.min(1.0, 2.0 - (2.0 * tCritHit))));

    scale([x, y]);

    text("Critical\nHit!", 0, 0);

    if (tCritHit >= 1) animatingCritHit = false;
  } else {
    scale([1, 1]);
  }

  pop();
  //

  // Handle Player
  if (p.alive) {
    p.enemies = enemies;
    p.curBulletDir = curBulletDir;

    noShoot = p.insideAnEnemy(false);
    slowMode = p.powerups.includes(Game.Items.DAZZLE);

    if (p.insideAnEnemy()) {
      if (!p.invincible){
        animBG(255, 125, 125, 0.35);
        animScreenShake(5.0,3.0);
      }
      p.hit();
    }

    p.update();
    // Add player trail point
    playerTrail.push({
      x: p.x,
      y: p.y,
      life: 1.0
    });
    // Draw player trail
    for (let i = playerTrail.length - 1; i >= 0; i--) {
      let t = playerTrail[i];
      t.life -= 0.04;

      if (t.life <= 0) {
        playerTrail.splice(i, 1);
        continue;
      }

      push();
      noStroke();
      fill(255, (125/2) * t.life);  // fading alpha
      square(t.x, t.y, p.size * 0.7);
      pop();
    }
    p.show();
  } else if (gameOver == false) {
    gameEnd();
  }
  
  if (gameOver){
    cursor();

    noStroke();
    fill(255,255,255,127);
    rect(0,0,width*2.0,height*2.0);
    
    drawGui();
    
    if (b.isReleased){
      newGame();
    }

    fill(255);
    stroke(20);
    text("Tank is Dead", width/2, 200.0);
    text(`== Stats ==\nWave reached: ${wave}\nScore: ${score}\nEnemies defeated: ${Game.enemiesDefeated}\nItems collected:\n${JSON.stringify([...Game.itemStats])}`,width/2, 300.0);
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
  }
}

function mousePressed() {
  if (!p.alive){
    
  } else {
    placeTankBuddy();
  }

  if (gameStarted){
    isShooting = true;
  }
}

let screenShake = false;
let shakeDuration = 0;
let shakeIntensity = 10;
let overrideScreenshake = false;

function animScreenShake(shake = 10.0, dur = 5.0){
  // TODO fix screenshake
  screenShake = true;
  shakeDuration = dur; // Shake for 30 frames
  shakeIntensity = shake; // Reset intensity
  // overrideScreenshake = override;
}

let bgPulseStart = null;
let bgPulseDuration = 0;
let bgPulseFrom = null;
let bgPulseTo = null;

function animBG(c1, c2, c3, dur){
  bgPulseFrom = [c1, c2, c3]; // we start at the flash color
  bgPulseTo = Game.getWaveCol(wave); // we fade back to normal
  bgCol = [...bgPulseFrom]; // immediate flash
  bgPulseDuration = dur * 1000.0; // ms
  bgPulseStart = millis();
}

let animatingCritHit = false;
let tCritHit = 1.0;

function animCritHit(){
  tCritHit = 0;
  animatingCritHit = true;
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