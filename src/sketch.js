const canSize = { x: 900, y: 720 }; // 5:4

// TODO use modules for multiple js files

// Objects
let p;
let e1;
let playerBullets = []; // playerSpikes
let enemyBullets = []; // enemySpikes
let enemies = [];
let items = [];
let isShooting = false;

// Game Loop
let waves = 0;
let score = 0;
let gameOver = false;
const enemySetEncounters = [0, 5, 13];

// Items
let slowMode = false;

// Debug
let noShoot = false;
let curBulletDir = {
  //curSpikeDir
  x: 0,
  y: -1,
};

const GRAV = 9.8;
let lastSpawnTime = 0.0;
let shootingSpdFactor = 0.045;

function handleEnemyBullet(b) {
  // handleCactiSpikes
  if (!b.alive) {
    Game.removeObject(playerBullets, b);
  }

  b.spd = Game.getEnemySpikesSpeed(slowMode);

  if (
    TankMath.circleCollision(b.x, b.y, b.size / 2.0, p.x, p.y, p.size / 2.0)
  ) {
    // TODO if player is invincinble, make bullets not splice

    p.hit();
    Game.removeObject(playerBullets, b);
  }

  b.update();
  b.show();
}

function handlePlayerBullet(b) {
  let removeBullet = false;

  // Enemy detection
  enemies.forEach((e) => {
    if (
      TankMath.circleCollision(e.x, e.y, e.size / 2.0, b.x, b.y, b.size / 2.0)
    ) {
      if (b.hasBeenReflected) {
        // TODO test
        e.hit(b.dirX, b.dirY, 2);
      } else {
        e.hit(b.dirX, b.dirY);
      }

      if (e.hasDied()) {
        let scoreGained = e.points;

        switch (e.type) {
          case Game.EnemyTypes.EXPLODER:
            let spd = 4.0;
            let size = 75.0;

            enemyBullets.push(new Bullet(e.x, e.y, 0, -1, spd, size));
            enemyBullets.push(new Bullet(e.x, e.y, 0, 1, spd, size));
            enemyBullets.push(new Bullet(e.x, e.y, -1, 0, spd, size));
            enemyBullets.push(new Bullet(e.x, e.y, 1, 0, spd, size));
            enemyBullets.push(new Bullet(e.x, e.y, -1, -1, spd, size));
            enemyBullets.push(new Bullet(e.x, e.y, 1, 1, spd, size));
            enemyBullets.push(new Bullet(e.x, e.y, -1, 1, spd, size));
            enemyBullets.push(new Bullet(e.x, e.y, 1, -1, spd, size));
            break;

          case Game.EnemyTypes.SPLITTER:
          // TODO get bullet direction and set the splitted's pos

            let lastX = e.x;
            let lastY = e.y;
            let h = ceil(e.initialHealth / 3.0);

            let enemy1 = new Enemy({
              x: lastX + 100,
              y: lastY,
              health: h,
              type: Game.EnemyTypes.SPLITTED,
              player: p,
            });
            let enemy2 = new Enemy({
              x: lastX - 100,
              y: lastY,
              health: h,
              type: Game.EnemyTypes.SPLITTED,
              player: p,
            });

            enemies.push(enemy1);
            enemies.push(enemy2);
            break;
        }

        Game.removeObject(enemies, e);
        score += scoreGained;
      }

      if (e.type == Game.EnemyTypes.REFLECTOR) {
        b.reflect();
      } else {
        removeBullet = true;
      }
    }
  });

  items.forEach((item) => {
    if (
      !item.opened &&
      TankMath.circleCollision(
        item.x,
        item.y,
        item.size / 2.0,
        b.x,
        b.y,
        b.size / 2.0)
    ) {
      item.hit();
      removeBullet = true;
    }
  });

  b.update();
  b.show();

  return !removeBullet && !TankMath.offScreen(b.x, b.y, canSize.x, canSize.y);
}

function handleEnemies() {
  enemies.forEach((e) => {
    e.slow = slowMode;

    if (e.spawnBullets() && e.canShoot) {
      let spd = Game.getEnemySpikesSpeed(slowMode);
      let size = 75.0;

      enemyBullets.push(new Bullet(e.x, e.y, 0, -1, spd, size));
      enemyBullets.push(new Bullet(e.x, e.y, 0, 1, spd, size));
      enemyBullets.push(new Bullet(e.x, e.y, -1, 0, spd, size));
      enemyBullets.push(new Bullet(e.x, e.y, 1, 0, spd, size));
    }

    e.update();
    e.show();
  });
}

let currentEnemyTypes = [Game.EnemyTypes.NORMAL];

function spawnRandomWaveEnemies(onWave = waves) {
  // experimental
  const curWave = onWave;
  let encounterSet = 0;

  if (curWave > enemySetEncounters[0] && curWave <= enemySetEncounters[1]) {
    encounterSet = 0;
  } else if (curWave > enemySetEncounters[1] && curWave <= enemySetEncounters[2]) {
    encounterSet = 1;
  } else {
    encounterSet = 2;
  }

  const randomType = Game.pickRandomIndex(
    Game.enemyEncounter,
    currentEnemyTypes,
    encounterSet
  );

  if (randomType != null) {
    currentEnemyTypes.push(randomType);
  }

  let healthMin = 3 + floor(waves / 5.0);
  // let healthFactor = Game.healthFactor;
  let enemySpawnsMin = 3 + floor(waves / 7.0);
  let enemySpawnsFactor = 3 + floor(waves / 7.0);

  let noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);

  for (let i = 0; i < noOfEnemies; i++) {
    let spawnX = TankMath.randomFloat(120.0, width - 120.0);
    let spawnY = TankMath.randomFloat(120.0, height - 120.0);
    let health = healthMin + floor(random() * Game.healthFactor);

    const randomType = currentEnemyTypes[floor(random() * currentEnemyTypes.length)];

    // TODO make the newly added enemy type appear in the wave it is added in

    let newEnemy = new Enemy({
      x: spawnX,
      y: spawnY,
      health: health,
      player: p,
      bulletDir: curBulletDir,
      type: randomType,
    });

    enemies.push(newEnemy);
  }
}

function spawnItem(item = -1) {
  print("Item spawn");
    
  let itemToSpawn = 0;

  if (item == -1){
    const types = Object.values(Game.Items);
    itemToSpawn = random(types);
  } else {
    itemToSpawn = item;
  }

  let spawnX = TankMath.randomFloat(200.0, width - 200);
  let spawnY = TankMath.randomFloat(200.0, height - 200);

  let i = new Item(spawnX, spawnY, itemToSpawn, p);

  items.push(i);
}
let bgIMG;

function preload() {
  bgIMG = loadImage("img/bg-main.png");
}

function setup() {
  createCanvas(canSize.x, canSize.y);

  textFont("Nunito");
  textStyle(BOLD);

  p = new Player();

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
  // bgIMG.filter(GRAY);

  push();
  translate(width / 2, height / 2);
  rotate(millis() * (1 / 18000));
  imageMode(CENTER);
  tint(255, 255, 155);
  image(bgIMG, 0, 0);
  pop();

  noCursor();
  frameRate(60);
  rectMode(CENTER);

  fill(GRAY);
  items = items.filter((i) => {
    i.enemies = enemies;

    i.update();
    i.show();
    return !i.collected && !TankMath.offScreen(i.x, i.y, canSize.x, canSize.y);
  });
  fill(255);

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

      if (p.powerups.includes(Game.Items.VARIABLE_SHOOTING)){
        extraX = (random() * 0.5) - 0.25;
        extraY = (random() * 0.5) - 0.25;
      }

      playerBullets.push(
        new Bullet(p.x, p.y, curBulletDir.x + extraX, curBulletDir.y + extraY, size)
      );
      if (p.powerups.includes(Game.Items.TWO_AXIS_SHOOTING)) {
        playerBullets.push(
          new Bullet(p.x, p.y, -curBulletDir.x + extraX, -curBulletDir.y + extraY, size)
        );
      }
      lastSpawnTime = millis();
    }
  }

  let a = 0.1 * QUARTER_PI * sin(millis() / 1.0 / 512.0);

  push();
  translate(width / 2, height / 1.1);
  stroke(50);
  rotate(a);
  displayText();
  pop();

  if (waves == 0) {
    strokeWeight(3);
    textSize(30);
    text("A game by Night Kolo", width / 2, 100);
    text("I love making a buggy mess :D", width / 2, 140);
  }

  // Handle playerBullets
  strokeWeight(5);
  playerBullets = playerBullets.filter(handlePlayerBullet);

  // Handle enemyBullets
  enemyBullets.forEach(handleEnemyBullet);

  handleEnemies();

  // TODO player death incomplete
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
function gotoNextWave() {
  waves++;
  print(waves);

  if (random() < 1 / 1) {
    spawnItem();
  }
  // let value = Game.EnemyTypes.SPLITTER;

  // spawnEnemy(value);
  spawnRandomWaveEnemies();
}

function displayText() {
  textAlign(CENTER);
  textSize(45);
  strokeWeight(7);
  text(`Wave ${waves}`, 0, 0);
}

function mousePressed() {
  isShooting = !isShooting;
}

function keyPressed(event) {
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") { 
    curBulletDir.x = 0;
    curBulletDir.y = -1;
  } else if (
    event.key === "ArrowDown" ||
    event.key === "s" ||
    event.key === "S"
  ) {
    curBulletDir.x = 0;
    curBulletDir.y = 1;
  } else if (
    event.key === "ArrowLeft" ||
    event.key === "a" ||
    event.key === "A"
  ) {
    curBulletDir.x = -1;
    curBulletDir.y = 0;
  } else if (
    event.key === "ArrowRight" ||
    event.key === "d" ||
    event.key === "D"
  ) {
    curBulletDir.x = 1;
    curBulletDir.y = 0;
  }
}

// Debug
function spawnEnemy(type) {
  let healthMin = 3;
  let healthFactor = 20.0;

  let thres = 250.0;
  let spawnX = TankMath.randomFloat(200.0, width - 200);
  let spawnY = TankMath.randomFloat(200.0, height - 200);
  let health = healthMin + floor(random() * healthFactor);

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

// function spawnWaveEnemies(onWave = waves) {
//   // experimental
//   const waveEnemies = Game.waves[onWave - 1];

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