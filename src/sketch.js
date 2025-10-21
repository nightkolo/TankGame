const canSize = { x: 900, y: 720 }; // 5:4

// Game: Tank is Dry

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
let difficulty = 0;
let gameOver = false;

// Debug
let noShoot = false;
let curBulletDir = { //curSpikeDir
  x: 0,
  y: -1, // default: up
};

let lastSpawnTime = 0.0;
let shootingSpdFactor = 0.045;

function handleEnemyBullet(b) { // handleCactiSpikes
  if (!b.alive) {
    removeObject(playerBullets, b);
  }
  
  if (TankMath.circleCollision(b.x, b.y, b.size / 2.0, p.x, p.y, p.size / 2.0)) {
    // TODO if player is invincinble, make bullets not splice
    
    p.hit();
    removeObject(playerBullets, b);
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
      e.hit(b.dirX, b.dirY);

      if (e.hasDied()) {
        let scoreGained = e.points;

        switch (e.type){
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

          case Game.EnemyTypes.SPLITTER:
            // TODO
        }

        removeObject(enemies, e);
        score += scoreGained;
      }

      if (e.type == Game.EnemyTypes.REFLECTOR) {
        // TODO make Reflector-reflected bullet grant 2 hitpoints
        b.reflect()
      } else {
        removeBullet = true;
      }
    }
  });

  items.forEach((item) => {
    if (
      TankMath.circleCollision(item.x, item.y, item.size / 2.0, b.x, b.y, b.size / 2.0)
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
    if (e.spawnBullets() && e.canShoot) {
      let spd = 4.0;
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

function spawnWaveEnemies(onWave = waves) {
  const waveEnemies = Game.waves[onWave - 1];

  if (waveEnemies == undefined) {
    gameOver = true;
    return;
  }

  for (let i = 0; i < waveEnemies.length; i++) {
    let healthRange = waveEnemies[i].hp[1] - waveEnemies[i].hp[0];
    let enemySpawns = waveEnemies[i].count[0] + floor(random() * (waveEnemies[i].count[1] - waveEnemies[i].count[0]));

    let enemyType;

    if (typeof(waveEnemies[i].type) == "object") { // Is a randomized enemy encounter
      enemyType = waveEnemies[i].type[
        floor(waveEnemies[i].type.length * random())
      ];
    } else { // Is a pre-defined enemy counter
      enemyType = waveEnemies[i].type;
    } 

    for (let j = 0; j < enemySpawns; j++) {
      let spawnX = random() * width;
      let spawnY = random() * height;

      let randomHealth = waveEnemies[i].hp[0] + floor(random() * healthRange);

      let newEnemy = new Enemy({
        x: spawnX,
        y: spawnY,
        health: randomHealth,
        player: p,
        type: enemyType,
      });

      enemies.push(newEnemy);
    }
  }
}

function spawnRandomEnemies() {
  let healthMin = 3;
  let healthFactor = 20.0;
  let enemySpawnsMin = 3;
  let enemySpawnsFactor = 3;

  let noOfEnemies = enemySpawnsMin + floor(random() * enemySpawnsFactor);

  for (let i = 0; i < noOfEnemies; i++) {
    let spawnX = random() * width;
    let spawnY = random() * height;
    let health = healthMin + floor(random() * healthFactor);

    const types = Object.values(Game.EnemyTypes);
    const randomType = random(types);

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

let idrop;

function setup() {
  createCanvas(canSize.x, canSize.y);

  p = new Player();

  idrop = new Item(width/2, height/2, Game.Items.TWO_AXIS_SHOOTING, p);

  items.push(idrop);

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
  noCursor();
  frameRate(60);
  rectMode(CENTER);

  items = items.filter((i) => {
    i.update();
    i.show();
    return !i.collected && !TankMath.offScreen(i.x, i.y, canSize.x, canSize.y);
  })

  if (enemiesDefeated()) {
    gotoNextWave();
  }

  // Spawn playerBullets
  if (isShooting && !noShoot) {
    if (millis() - lastSpawnTime > shootingSpdFactor * 1000.0) {
      let size = 12.5;

      playerBullets.push(new Bullet(p.x, p.y, curBulletDir.x, curBulletDir.y, size));
      if (p.two_axis_shooting) {
        playerBullets.push(new Bullet(p.x, p.y, -curBulletDir.x, -curBulletDir.y, size));
      }
      lastSpawnTime = millis();
    }
  }

  // Handle playerBullets
  playerBullets = playerBullets.filter(handlePlayerBullet);
  // Handle enemyBullets
  enemyBullets.forEach(handleEnemyBullet);

  handleEnemies();

  // TODO player death incomplete
  if (p.alive) {
    p.enemies = enemies;
    noShoot = p.insideAnEnemy(false);

    if (p.insideAnEnemy()) {
      // TODO add better feedback for player getting hit
      p.hit();
    }

    p.update();
    p.show();
  }

  displayText();
}

function removeObject(objs, obj){
  const index = objs.indexOf(obj);
  if (index > -1) {
    objs.splice(index, 1);
  }
}

function enemiesDefeated() {
  return enemies.length == 0 && !gameOver;
}

function spawnItem(){

}

function gotoNextWave() {
  waves++;
  print(waves);

  if (random() < 1/4){
    spawnItem();
  }
  spawnRandomEnemies();
  // spawnWaveEnemies();
}

function displayText() {
  textAlign(LEFT);
  textSize(45);
  text(`Wave: ${waves}`, 100, height - 100);

  // text(`Wave: ${waves} / ${Game.waves.length}`, 100, height - 100);
  text(`Your Score: ${score}`, 100, height - 150);
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