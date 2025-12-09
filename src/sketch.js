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

// Game Loops
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
let curBulletDir = { x: 0, y: -1 };

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

  // Item detection
  items.forEach((item) => {
    if (!item.opened && GameMath.circleCollision(item.x, item.y, item.size / 2.0, bullet.x, bullet.y, bullet.size / 2.0)
    ) {
      itemHitSFX.rate(random(0.8, 1.2));
      itemHitSFX.play();
      item.hit();
      removeBullet = true;
    }
  });

  bullet.update();
  bullet.show();

  return !removeBullet && !GameMath.offScreen(bullet.x, bullet.y, canSize.x, canSize.y);
}

function hitEnemy(bullet, targetEnemy, playAud = true){
  let sfx;

  // Audio
  if (playAud){
    const sfxMap = { // Builds Map
      [Game.EnemyTypes.SHOOTER]: enemyHit3SFXs,    // "shooter" → array of sounds
      [Game.EnemyTypes.BOUNCER]: enemyHit5SFXs,    // "bouncer" → array of sounds
      [Game.EnemyTypes.REFLECTOR]: enemyHit1SFXs,  // "reflector" → array of sounds
      [Game.EnemyTypes.EXPLODER]: enemyHit4SFXs,   // "exploder" → array of sounds
    };
 
    // const value = primaryOption || fallbackOption;
    // If primaryOption is truthy, use it
    // If primaryOption is falsy (null, undefined, 0, false, "", etc.), use fallbackOption
    const sfxArray = sfxMap[targetEnemy.type] || [enemyHitSFX]; // Looking Up the Sound Array
    const sfx = sfxArray[floor(random(sfxArray.length))]; // Picking a Random Sound

    // -1 * ((((width - targetEnemy.x) / width) * 2.0) - 1.0)
    sfx.stereo(map(targetEnemy.x, 0, width, -1, 1, true))
    sfx.rate(1.25 - (1.25 * (targetEnemy.health / targetEnemy.getInitialHealth())))
    sfx.play();
  }
  //
  targetEnemy.hit(bullet.dirX, bullet.dirY, (bullet.hasBeenReflected) ? 2 : 1);

  targetEnemy.animBounce();
  enemyDied(targetEnemy, bullet);
  
  if (targetEnemy.type === Game.EnemyTypes.REFLECTOR) {
    bullet.reflect();
  }

  return targetEnemy.type !== Game.EnemyTypes.REFLECTOR;
}

function enemyDied(targetEnemy, bullet){
  if (!targetEnemy.hasDied()) return;

  let scoreGained = targetEnemy.points;

  Game.lastEnemyTypeHit = targetEnemy.type;
  Game.enemiesDefeated++;

  animScreenShake(targetEnemy.points*2.5, targetEnemy.points*3.0);

  switch (targetEnemy.type) {
    case Game.EnemyTypes.EXPLODER:
      const spd = Game.getEnemyBulletsSpeed(slowMode);
      const size = 75.0;
      const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, 1], [-1, 1], [1, -1]
      ]

      directions.forEach((entry) => {
        enemyBullets.push(new Bullet(targetEnemy.x, targetEnemy.y, entry[0], entry[1], spd, size));
      });
      break;

    case Game.EnemyTypes.SPLITTER:
      const lastX = targetEnemy.x;
      const lastY = targetEnemy.y;
      const h = ceil(targetEnemy.getInitialHealth() / 3.0);
      const variants = [-1, 1];

      variants.forEach((sign) => {
        const enemy1 = new Enemy({
          x: lastX + (sign * 100 * -bullet.dirY),
          y: lastY + (sign * 100 * bullet.dirX),
          health: h,
          type: Game.EnemyTypes.SPLITTED,
          player: p,
        });

        enemies.push(enemy1);
      })
      break;
  }
  
  if (enemies.length === waveEnemyCount){
    let sfx = enemyDeadSFXsFirst[floor(random() * enemyDeadSFXsFirst.length)];
    sfx.stereo(map(targetEnemy.x, 0, width, -1, 1)).play();
    // sfx.play();  
  } else {
    enemyDeadSFX.rate(1.25 - ((enemies.length / waveEnemyCount) * 1.25));
    enemyDeadSFX.stereo(map(targetEnemy.x, 0, width, -1, 1)).play();
    // enemyDeadSFX.play();
  }

  Game.removeObject(enemies, targetEnemy);
  score += scoreGained;
}

function handleTankBuddies(buddy){
  if (buddy.spawnBullets()) {
    const spd = 10.0;

    Game.allDir.forEach((entry) => {
      buddyBullets.push(new Bullet(buddy.x, buddy.y, entry[0], entry[1], spd));
    })
  }

  buddy.update();
  buddy.show();

  return buddy.alive;
}

function spawnItem(item = -1) {
  const itemToSpawn = item === -1 ? random(Object.values(Game.Items)) : item;

  items.push(new Item(GameMath.randomFloat(200.0, width - 200), GameMath.randomFloat(200.0, height - 200), itemToSpawn, p));
}

let waveEnemyCount = 1;

function spawnRandomWaveEnemies(onWave = wave) {
  creatingEnemies = true;

  let encounterSet;
  if (onWave <= enemySetEncounters[1]) {
    encounterSet = 0;
  } else if (onWave <= enemySetEncounters[2]) {
    encounterSet = 1;
  } else {
    encounterSet = 2;
  }

  const randomType = Game.pickRandomIndex(Game.enemyEncounter, currentEnemyTypes, encounterSet);

  if (randomType !== null) {
    currentEnemyTypes.push(randomType);
  }

  const healthMin = 3 + floor(wave / 9.0);
  const enemySpawnsMin = 2 + floor(wave / 13.0);
  const enemySpawnsFactor = 3 + floor(wave / 13.0);
  const enemySpeed = Game.defaultEnemySpeed + (floor(wave / 2.0) / 10.0);
  
  const noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);
  waveEnemyCount = noOfEnemies;

  for (let i = 0; i < noOfEnemies; i++) {
    const spawnX = GameMath.randomFloat(120.0, width - 120.0);
    const spawnY = GameMath.randomFloat(120.0, height - 120.0);
    const health = healthMin + floor(random() * Game.enemyHealthFactor);

    // console.log(`Enemy (${i + 1}): ${round(spawnX)}, ${round(spawnY)}, ${health}`);

    const randomType = currentEnemyTypes[floor(random() * currentEnemyTypes.length)];

    const newEnemy = new Enemy({
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

  setTimeout(enemiesSpawned, 1000.0 * Game.enemySpawnTime);
}

function enemiesSpawned(){
  // Claude-generated

  // Map enemy types to their corresponding SFX
  const enemyTypeSFXMap = {
    [Game.EnemyTypes.SPLITTER]: enemyReflectorEntSFX,
    [Game.EnemyTypes.SHOOTER]: enemyShooterEntSFX,
    [Game.EnemyTypes.BOUNCER]: enemyRBEntSFX,
  };

  // Collect unique enemy types present
  // Set is a JavaScript data structure that stores unique values only—if you try to add a duplicate, it ignores it.
  const presentTypes = new Set(
    enemies
      .map(e => e.type) // extracts all enemy types
      .filter(type => type in enemyTypeSFXMap) // Keep only mapped types
  );

  // Play corresponding SFX for each present type
  presentTypes.forEach((type) => {
    enemyTypeSFXMap[type].play()
  });

  creatingEnemies = false;
}

let creatingEnemies = false;

function gotoNextWave() {
  console.log(wave);
  
  if (floor((wave + 1) / 10.0) == (wave + 1) / 10.0) {
    next10wave1SFX.play(); 
    next10wave2SFX.play(); 
  } else if (p.lives < 2){
    p.criticalHealthSFX.play();
  } else {
    nextwaveSFX.play();
  }
  
  wave++;
  animText();
  
  Game.bestWave = (wave > Game.bestWave) ? wave : Game.bestWave;
  bgCol = Game.getWaveCol(wave);
  
  if (random() < 1 / 3) {
    // spawnItem(Game.Items.TANK_BUDDY);
    spawnItem();
  }
  // let value = Game.EnemyTypes.REFLECTOR;
  
  // spawnEnemy(value);
  spawnRandomWaveEnemies(wave);
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
  wave = 0;

  Game.setGame();
  animText();
  bgCol = Game.getWaveCol(wave);

  p = new Tank();

  e1 = new Enemy({x: width / 2, y: height / 2, health: 10, player: p, type: Game.EnemyTypes.NORMAL, followPlayer: false, bulletDir: curBulletDir});
  enemies.push(e1);
}

let bgIMG, icon, iconDazzle, iconCS, iconBuddy, iconInacc, panel, panel2, arrowIMG, fonts;

function preload() {
  panel = loadImage('img/panel-01.svg');
  panel2 = loadImage('img/panel-02.svg');
  arrowIMG = loadImage('img/arrow-01.png');

  icon = loadImage('img/power-up-icon-def.svg');
  iconDazzle = loadImage('img/item-icon-dazzle.svg');
  iconCS = loadImage('img/item-icon-counter-spike.svg');
  iconBuddy = loadImage('img/item-icon-tankbuddy.svg');
  iconInacc = loadImage('img/item-icon-inaccuracy-01.svg');
 
  bgIMG = loadImage("img/bg-main-03.png");
  fonts = loadFont("font/Nunito-Bold.ttf");
}

let b, gui;

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

const introAnim = {
  text: { x: 0.0, y: 0.0, dir: 0.0, accel: 0.0 },
  bubble: { x: 0.0, y: 0.0, dir: 0.0, accel: 0.0 },
  t: 0.0,
  playing: false
};
const waveAnim = {
  playing: false,
  t: 1.0
}
const critHitAnim = {
  playing: false,
  t: 1.0
}

let statsSet = false;

function draw() {
  // Uncaught TypeError: Cannot read properties of undefined (reading '0')
  background(bgCol[0], bgCol[1], bgCol[2]);

  if (screenShake) {
    translate(random(-shakeIntensity, shakeIntensity), random(-shakeIntensity, shakeIntensity));

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
        // Cannot read properties of undefined (reading '0') @ wave 50+
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
  if (enemies.length == 0 && !gameOver && gameStarted && !creatingEnemies) {
    gotoNextWave();
  }

  // Spawn playerBullets
  if (isShooting && !noShoot && !gameOver) {
    if (millis() - lastSpawnTime > shootingSpdFactor * 1000.0) {
      const size = 12.5;
      const factor = 0.045;
      const extraX = (p.powerups.includes(Game.Items.INACCURACY)) ? (random() * 0.5) - 0.25 : 0.0;
      const extraY = (p.powerups.includes(Game.Items.INACCURACY)) ? (random() * 0.5) - 0.25 : 0.0;
      shootingSpdFactor = (p.powerups.includes(Game.Items.INACCURACY)) ? factor / 1.25 : factor;

      playerBullets.push(new Bullet(p.x, p.y, curBulletDir.x + extraX, curBulletDir.y + extraY, size));
      
      if (p.powerups.includes(Game.Items.COUNTER_SPIKE)) {
        // TODO make other axis bullets a different fill
        
        playerBullets.push(new Bullet(p.x, p.y, -curBulletDir.x + extraX, -curBulletDir.y + extraY, size));
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
        enemyHit2SFX.rate(random(0.8, 1.2)).play();

        removeBullet = hitEnemy(b, e, false);

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
      const spd = Game.getEnemyBulletsSpeed(slowMode);
      const size = 75.0;

      Game.allDir.forEach((entry) => {
        enemyBullets.push(new Bullet(e.x, e.y, entry[0], entry[1], spd, size))
      });
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
  if (waveAnim.playing) {
    waveAnim.t += deltaTime * 0.0006;
    let eased = Anim.elasticEaseOut(constrain(waveAnim.t, 0, 1));
    let x = lerp(1.5, 1, eased);
    let y = lerp(0.5, 1, eased);

    scale([x, y]);
    if (waveAnim.t >= 1) waveAnim.playing = false;
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
    const itemHeld = activeTimes[i][0];
    const timeLeft = activeTimes[i][1];

    const w = width - 120.0 - (120.0 * i);
    const h = height - 100.0;
    
    let barHeight = 100.0 * (timeLeft / Game.powerupTime);
    
    rectMode(CORNER);
    noStroke();

    let flash = 1.0;
    if (timeLeft <= 3.0 || itemHeld === "Tank Buddy") {
      flash = map(sin(millis() * 0.015), -1, 1, 0.5, 1);
    }
    fill(255, 255 * flash, 255 * flash);

    rect(w - 50.0, h - barHeight + 50.0, 100.0, barHeight, 10.0, 10.0);
    
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
  if (critHitAnim.playing) {
    critHitAnim.t += deltaTime * 0.00045;
    let eased = Anim.elasticEaseOut(constrain(critHitAnim.t, 0, 1));
    let x = lerp(Game.critHitScaleX, 1, eased);
    let y = lerp(Game.critHitScaleY, 1, eased);

    // TODO set text color to attacked Enemy color
    fill(255, 255, 55, 255 * (Math.min(1.0, 2.0 - (2.0 * critHitAnim.t))));
    stroke(30, 255 * (Math.min(1.0, 2.0 - (2.0 * critHitAnim.t))));

    scale([x, y]);

    text("Critical\nHit!", 0, 0);

    if (critHitAnim.t >= 1) critHitAnim.playing = false;
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

  push();
  translate(width/2, height/2);
  stroke(50);
  textAlign(CENTER);
  textSize(35);
  strokeWeight(4);
  
  rotate((PI / 28.0) * sin(introAnim.t / 720.0));
  const hei = -150.0;
  
  if (wave === 0){
    introAnim.text.x = 0.0;
    introAnim.text.y = 0.0;
    introAnim.bubble.x = 0.0;
    introAnim.bubble.y = 0.0;
    introAnim.playing = false;

    introAnim.t += deltaTime;
    arrowIMG.resize(40.0, 25.0);
    image(arrowIMG, 0, (sin(millis() / 260.0) * 10.0) + hei + 70.0);

  } else if (wave === 1) {
    if (!introAnim.playing){
      introAnim.bubble.accel = random(-650.0, -450.0);
      introAnim.bubble.dir = Math.sign(random() - 0.5);
      introAnim.text.accel = random(-500.0, -300.0);
      introAnim.text.dir = -introAnim.bubble.dir;

      introAnim.playing = true;
    }
    
    // Update bubble
    introAnim.bubble.accel += 9.8 * 2.0;
    introAnim.bubble.y += introAnim.bubble.accel * deltaTime * 0.001;
    introAnim.bubble.x += introAnim.bubble.dir * deltaTime * 0.15;

    // Update text
    introAnim.text.accel += 9.8 * 2.0;
    introAnim.text.y += introAnim.text.accel * deltaTime * 0.001;
    introAnim.text.x += introAnim.text.dir * deltaTime * 0.15;
  }

  rect(introAnim.bubble.x, hei + introAnim.bubble.y, 250.0, 80.0, 30.0);
  text(Game.bubbleMessage, introAnim.text.x, hei + introAnim.text.y);
  
  pop();
  
  if (gameOver){
    if (!statsSet){
      statsSet = true;
    }
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
    text(`== Stats ==\nWave reached: ${wave}\nScore: ${score}\nEnemies defeated: ${Game.enemiesDefeated}\nItems collected:`,width/2, 300.0);
    // ${JSON.stringify([...Game.itemStats])}

    // const arr = Array.from(Game.itemStats);
    let i = 0;

    // const numOfStats = Game.itemStats.filter((value, key) => { 
    //   return value !== 0
    // }).length

    Game.itemStats.forEach((value, key) => { 
      if (value !== 0){
        text(`${key}: ${value}`, width/2, (height / 1.5) + (40.0 * i));
      } 
      // console.log(i, key, value);
      i++;
    })
  }
}

function placeTankBuddy(){
  if (p.powerups.includes(Game.Items.TANK_BUDDY)){
    tankbuddyDropSFX.play();

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

function animCritHit(){
  critHitAnim.t = 0;
  critHitAnim.playing = true;
}

function animText(){
  if (waveAnim.t < 0.5) return;

  waveAnim.t = 0;
  waveAnim.playing = true;
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