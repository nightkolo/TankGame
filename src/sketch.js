const canSize = { x: 900, y: 720 }; // 5:4

// Objects
let p, e1;
let playerBullets = []; 
let enemyBullets = []; 
let buddyBullets = [];
let tankBuddies = [];
let items = [];
let bombs = [];

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
let statsSet = false;
let currentItemStats = [];

// Debug
let noShoot = false;
let curBulletDir = { x: 0, y: -1 };
let creatingEnemies = false;

// Juice
let bgCol = Game.bgCols[0];
let playerTrail = [];
const introAnim = {
  text: { x: 0.0, y: 0.0, dir: 0.0, accel: 0.0 },
  bubble: { x: 0.0, y: 0.0, dir: 0.0, accel: 0.0 },
  t: 0.0, playing: false
};
const waveAnim = { playing: false, t: 1.0 };
const critHitAnim = { playing: false, t: 1.0 };
const screenshakeAnim = { playing: false, dur: 0, strength: 10 };
const bgAnim = { bgPulseStart: null, bgPulseDuration: 0, bgPulseFrom: null, bgPulseTo: null };


function handleEnemyBullets(bullet) {
  if (!bullet.alive) {
    Game.removeObject(enemyBullets, bullet);
  }

  bullet.spd = Game.getEnemyBulletsSpeed(Game.isSlowMode);

  if (!p.invincible && GameMath.circleCollision(bullet.x, bullet.y, (bullet.size / 2.0) / Game.ENEMY_BULLETS_HITBOX_SIZE_DIVISOR, p.x, p.y, p.size / 2.0)) {
    p.hit();
    Game.removeObject(enemyBullets, bullet);
  }

  bullet.update();
  bullet.show();
}

function handlePlayerBullets(bullet) {
  let removeBullet = false;

  Game.currentEnemies.forEach((e) => {
    if (GameMath.circleCollision(e.x, e.y, (e.size / 2.0) * Game.ENEMY_HURTBOX_SIZE_FACTOR, bullet.x, bullet.y, bullet.size / 2.0)) {
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
  if (gameOver) return;

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
      const spd = Game.getEnemyBulletsSpeed(Game.isSlowMode);
      const size = 75.0;
      const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, 1], [-1, 1], [1, -1]
      ];

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
          type: Game.EnemyTypes.SPLITTED
        });

        Game.currentEnemies.push(enemy1);
      })
      break;
  }
  
  if (Game.currentEnemies.length === waveEnemyCount){
    let sfx = enemyDeadSFXsFirst[floor(random() * enemyDeadSFXsFirst.length)];
    sfx.stereo(map(targetEnemy.x, 0, width, -1, 1))
    sfx.play();  
  } else {
    enemyDeadSFX.rate(1.25 - ((Game.currentEnemies.length / waveEnemyCount) * 1.25));
    enemyDeadSFX.stereo(map(targetEnemy.x, 0, width, -1, 1))
    enemyDeadSFX.play();
  }

  Game.removeObject(Game.currentEnemies, targetEnemy);
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

  items.push(new Item(GameMath.randomFloat(200.0, width - 200), GameMath.randomFloat(200.0, height - 200), itemToSpawn));
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
  const enemySpeed = Game.DEFAULT_ENEMY_SPEED + (floor(wave / 2.0) / 10.0);
  
  const noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);
  waveEnemyCount = noOfEnemies;

  for (let i = 0; i < noOfEnemies; i++) {
    const spawnX = GameMath.randomFloat(120.0, width - 120.0);
    const spawnY = GameMath.randomFloat(120.0, height - 120.0);
    const health = healthMin + floor(random() * Game.ENEMIES_HEALTH_MAX);

    // console.log(`Enemy (${i + 1}): ${round(spawnX)}, ${round(spawnY)}, ${health}`);

    const randomType = currentEnemyTypes[floor(random() * currentEnemyTypes.length)];

    const newEnemy = new Enemy({
      x: spawnX,
      y: spawnY,
      health: health,
      maxSpeed: enemySpeed,
      bulletDir: curBulletDir,
      type: randomType,
    });

    Game.currentEnemies.push(newEnemy);
  }

  setTimeout(enemiesSpawned, 1000.0 * Game.ENEMY_SPAWN_TIME);
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
    Game.currentEnemies
      .map(e => e.type) // extracts all enemy types
      .filter(type => type in enemyTypeSFXMap) // Keep only mapped types
  );

  // Play corresponding SFX for each present type
  presentTypes.forEach((type) => {
    enemyTypeSFXMap[type].play()
  });

  creatingEnemies = false;
}

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
    // spawnItem(Game.Items.DAZZLE);
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
  Game.currentEnemies = [];
  items = [];
  statsSet = false;
 
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

  e1 = new Enemy({x: width / 2, y: height / 2, health: 10, type: Game.EnemyTypes.NORMAL, followPlayer: false, bulletDir: curBulletDir});
  Game.currentEnemies.push(e1);
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

  b = createButton("Another whirl?", width/2 - 100, height - 180.0, 200, 50);
  b.setStyle({
      fillBg: color("#fbbfbfff"),
      font: fonts,
      rounding: 5,
      textSize: 2,
      textSize: 24,
      fillBgHover: color("#ffffffff"),
      fillBgActive: color("#000000ff"),
      fillLabelActive: color("#ffffffff")
  });

  Game.setGame();
  newGame();
}

function draw() {
  // Uncaught TypeError: Cannot read properties of undefined (reading '0')
  background(bgCol[0], bgCol[1], bgCol[2]);

  if (screenshakeAnim.playing) {
    translate(random(-screenshakeAnim.strength, screenshakeAnim.strength), random(-screenshakeAnim.strength, screenshakeAnim.strength));

    screenshakeAnim.dur -= deltaTime / 16.0;
    screenshakeAnim.playing = screenshakeAnim.dur > 0;
  }

  // Handle BG
  push();
  translate(width / 2, height / 2);
  rotate(millis() * (1 / 18000));
  imageMode(CENTER);

  if (bgAnim.bgPulseStart !== null) {
    let t = (millis() - bgAnim.bgPulseStart) / bgAnim.bgPulseDuration;

    if (t >= 1) {
      bgCol = Game.getWaveCol(wave);
      bgAnim.bgPulseStart = null;
    } else {
      bgCol = [
        lerp(bgAnim.bgPulseFrom[0], bgAnim.bgPulseTo[0], t),
        lerp(bgAnim.bgPulseFrom[1], bgAnim.bgPulseTo[1], t),
        lerp(bgAnim.bgPulseFrom[2], bgAnim.bgPulseTo[2], t)
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
  if (Game.currentEnemies.length == 0 && !gameOver && gameStarted && !creatingEnemies) {
    gotoNextWave();
  }

  // Spawn playerBullets
  if (isShooting && !noShoot && !gameOver) {
    if (millis() - lastSpawnTime > shootingSpdFactor * 1000.0) {
      const size = 12.5;
      const factor = 0.045;
      const extraX = (p.activePowerups.includes(Game.Items.INACCURACY)) ? random(-0.3, 0.3) : random(-0.06, 0.06);
      const extraY = (p.activePowerups.includes(Game.Items.INACCURACY)) ? random(-0.3, 0.3) : random(-0.06, 0.06);
      shootingSpdFactor = (p.activePowerups.includes(Game.Items.INACCURACY)) ? factor / 1.5 : factor;

      playerBullets.push(new Bullet(p.x, p.y, curBulletDir.x + extraX, curBulletDir.y + extraY, size));
      
      if (p.activePowerups.includes(Game.Items.COUNTER_SPIKE)) {
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

    Game.currentEnemies.forEach((e) => {
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
  Game.currentEnemies.forEach((e) => {
    // e.Game.isSlowMode = Game.isSlowMode;

    if (e.spawnBullets() && e.canShoot) {
      const spd = Game.getEnemyBulletsSpeed(Game.isSlowMode);
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
    i.update();
    i.show();
    return !i.collected && !GameMath.offScreen(i.x, i.y, canSize.x, canSize.y, i.size);
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

    b.explode(Game.currentEnemies);

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

    textLeading(40);
    text("A Game by Night Kolo\nMade in p5.js", width / 2, 100);
    // text("Tank is Tiny", width/4, (height / 2.0) - 140.0);
    
    strokeWeight(7.5);
    stroke(50);
    textLeading(33);
    image(panel, width/4, height/2);
    text("Hold to\nShoot", (width / 4), (height / 2.0) + 140.0);
    image(panel2, (width/4) * 3.0, height/2);
  }

  // Item interface
  textSize(25);
  textAlign(CENTER);
  strokeWeight(5);
  stroke(50);
  fill(255);

  // Obtain only active times from itemTimes Map
  const activeTimes = Array.from(Game.itemTimes.entries()).filter(([key, value]) => {
    return value !== 0.0;
  });

  for (let i = 0; i < activeTimes.length; i++){
    const itemHeld = activeTimes[i][0];
    const timeLeft = activeTimes[i][1];

    const w = width - 120.0 - (120.0 * i);
    const h = height - 100.0; 
    const barHeight = 100.0 * (timeLeft / Game.POWERUP_LIFETIME);
    
    rectMode(CORNER);
    noStroke();

    let flash = 1.0;
    if (timeLeft <= 3.0 || itemHeld === Game.Items.TANK_BUDDY.name) {
      flash = map(sin(millis() * 0.015), -1, 1, 0.5, 1);
    }
    fill(255, 255 * flash, 255 * flash);

    rect(w - 50.0, h - barHeight + 50.0, 100.0, barHeight, 10.0, 10.0);
    
    rectMode(CENTER);
    stroke(50);
    
    if (itemHeld === Game.Items.COUNTER_SPIKE.name){
      image(iconCS, w, h);
    } else if (itemHeld === Game.Items.DAZZLE.name){
      image(iconDazzle, w, h);
    } else if (itemHeld === Game.Items.TANK_BUDDY.name){
      image(iconBuddy, w, h);
      textSize(20);
      textLeading(25);
      text('Click to\nRelease!', w, h - 75.0);
  
      textSize(30);
      text(`${activeTimes[i][1]}`,w + 45.0, h + 45.0);
    } else if (itemHeld === Game.Items.INACCURACY.name){
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
    const eased = Anim.elasticEaseOut(constrain(critHitAnim.t, 0, 1));
    const x = lerp(Game.critHitScaleX, 1, eased);
    const y = lerp(Game.critHitScaleY, 1, eased);

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
    p.curBulletDir = curBulletDir;
    Game.currentPlayer = p;

    noShoot = p.insideAnEnemy(false);
    Game.isSlowMode = p.activePowerups.includes(Game.Items.DAZZLE);

    if (p.insideAnEnemy()) {
      if (!p.invincible){
        animBG(255, 125, 125, 0.35);
        animScreenShake(5.0,3.0);
      }
      p.hit();
    }

    p.update();
    // Add player trail point
    playerTrail.push({x: p.x,y: p.y,life: 1.0});
    // Draw player trail
    for (let i = playerTrail.length - 1; i >= 0; i--) {
      let t = playerTrail[i];
      t.life -= deltaTime * 0.0025;
      
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
  textLeading(28);
  textSize(Game.BUBBLE_MESSAGE[1]);
  strokeWeight(4);
  
  rotate((PI / 28.0) * sin(introAnim.t / 720.0));
  const hei = -150.0;
  
  if (wave === 0){
    introAnim.text.x = 0.0;
    introAnim.text.y = 0.0;
    introAnim.bubble.x = 0.0;
    introAnim.bubble.y = (Game.BUBBLE_MESSAGE[0].includes("\n")) ? 15.0 : -5.0;
    introAnim.playing = false;

    introAnim.t += deltaTime;
    arrowIMG.resize(40.0, 25.0);
    image(arrowIMG, 0, (sin(millis() / 260.0) * 10.0) + hei + 70.0);

  } else if (wave < 4) {
    if (!introAnim.playing){
      introAnim.bubble.accel = random(-650.0, -450.0);
      introAnim.bubble.dir = Math.sign(random() - 0.5);
      introAnim.text.accel = random(-500.0, -300.0);
      introAnim.text.dir = -introAnim.bubble.dir;

      introAnim.playing = true;
    }
    
    introAnim.bubble.accel += deltaTime * Game.GRAV * 0.075;
    introAnim.bubble.y += introAnim.bubble.accel * deltaTime * 0.001;
    introAnim.bubble.x += introAnim.bubble.dir * deltaTime * 0.15;

    introAnim.text.accel += deltaTime * Game.GRAV * 0.075;
    introAnim.text.y += introAnim.text.accel * deltaTime * 0.001;
    introAnim.text.x += introAnim.text.dir * deltaTime * 0.15;
  }

  rect(introAnim.bubble.x, hei + introAnim.bubble.y, 320.0, 100.0, 30.0);
  text(Game.BUBBLE_MESSAGE[0], introAnim.text.x, hei + introAnim.text.y);
  
  pop();
  
  // Game over screen
  if (gameOver){
    if (!statsSet){
      currentItemStats = [];
      
      Game.itemStats.forEach((value, key) => {
        if (value > 0) currentItemStats.push([key, value]);
      });
      statsSet = true;
    }
    cursor();
    noStroke();
    fill(255,255,255,127);
    rect(0,0,width*2.0,height*2.0);
    
    drawGui();
    if (b.isReleased) newGame();

    fill(255);
    stroke(20);
    textLeading(33);
    strokeWeight(10);
    textSize(60);
    text("Tank is Dead", width/2, 200.0);

    strokeWeight(5);
    textSize(25);
    text(`== Stats ==\nWave reached: ${wave}\nScore: ${score}\nEnemies defeated: ${Game.enemiesDefeated}`,width/2, 285.0);

    let i = 0;
    if (currentItemStats.length > 0){
      text("Items collected:", width/2, 420.0);

      currentItemStats.forEach((entry) => { 
        const name = entry[0];
        const amount = entry[1];
  
        const mult = 120.0;
        const w = (width / 2) + (mult * i) - ((currentItemStats.length - 1) * mult * 0.5);
        const h = height - 250.0;
  
        if (name === Game.Items.COUNTER_SPIKE.name){
          image(iconCS, w, h);
        } else if (name === Game.Items.INACCURACY.name){
          image(iconInacc, w, h);
        } else if (name === Game.Items.DAZZLE.name){
          image(iconDazzle, w, h);
        } else if (name === Game.Items.TANK_BUDDY.name){
          image(iconBuddy, w, h);
        } else if (name === Game.Items.BOMB.name){
          image(icon, w, h);
        }
  
        strokeWeight(8);
        textSize(45);
        text(`${amount}`, w + 40.0, h + 40.0);
        i++;
      })
    }
  }
}

function placeTankBuddy(){
  if (p.activePowerups.includes(Game.Items.TANK_BUDDY)){
    tankbuddyDropSFX.play();

    if (p.tankBuddiesOwned >= 1){
      p.tankBuddiesOwned--;
      Game.setItemTimer(Game.Items.TANK_BUDDY, p.tankBuddiesOwned);
    }

    let s = new TankBuddy(p.x, p.y, shootingSpdFactor * 2.0);
    tankBuddies.push(s);

    Game.removeObject(p.activePowerups, Game.Items.TANK_BUDDY);
  }
}

function mousePressed() { if (p.alive) placeTankBuddy(); }

function animScreenShake(shake = 10.0, dur = 5.0){
  screenshakeAnim.playing = true;
  screenshakeAnim.dur = dur;
  screenshakeAnim.strength = shake;
}

function animBG(c1, c2, c3, dur){
  bgAnim.bgPulseFrom = [c1, c2, c3];
  bgAnim.bgPulseTo = Game.getWaveCol(wave);
  bgCol = [...bgAnim.bgPulseFrom]; 
  bgAnim.bgPulseDuration = dur * 1000.0;
  bgAnim.bgPulseStart = millis();
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

let upHeld = false;
let downHeld = false;
let leftHeld = false;
let rightHeld = false;

function updateAxes() {
  shootX = (rightHeld ? 1 : 0) + (leftHeld ? -1 : 0);
  shootY = (downHeld ? 1 : 0) + (upHeld ? -1 : 0);

  isShooting = shootX !== 0 || shootY !== 0;

  if (shootX !== 0 || shootY !== 0) {
    const mag = Math.hypot(shootX, shootY);
    curBulletDir.x = shootX / (mag || 1);
    curBulletDir.y = shootY / (mag || 1);
  }
}

function keyPressed(e) {
  const k = e.key.toLowerCase();

  if (k === "w" || k === "arrowup")    upHeld = true;
  if (k === "s" || k === "arrowdown")  downHeld = true;
  if (k === "a" || k === "arrowleft")  leftHeld = true;
  if (k === "d" || k === "arrowright") rightHeld = true;

  updateAxes();
}

function keyReleased(e) {
  const k = e.key.toLowerCase();

  if (k === "w" || k === "arrowup")    upHeld = false;
  if (k === "s" || k === "arrowdown")  downHeld = false;
  if (k === "a" || k === "arrowleft")  leftHeld = false;
  if (k === "d" || k === "arrowright") rightHeld = false;

  updateAxes();
}