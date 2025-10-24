class Enemy {
  // Cacti
  constructor({
    x = 200,
    y = 200,
    health = 10,
    maxSpeed = 1.35,
    type = Game.EnemyTypes,
    followPlayer = true,
    player,
  } = {}) {
    this.x = x;
    this.y = y;

    // Stats
    this.size = this.getSize();
    this.maxSpeed = maxSpeed;
    this.health = health;
    this.initialHealth = health;
    this.points = round(health / 4.0); // deprecated
    this.player = player;

    // Type
    this.type = type;

    // Bouncer
    this.accel = 0.0;
    this.grav = 9.8;
    this.dirX = Math.sign(random() - 0.5);
    this.h = y / 2.0;

    // Item
    this.slow = false;

    // Misc.
    this.col = [0, 0, 0];
    this.followPlayer = followPlayer;
    this.lastShotTime = 0;
    this.canShoot = false;
    this.isHit = false;
    this.shootingSpdFactor = 1.25;
    this.slowShootingSpdFactor = this.shootingSpdFactor * 4.0;
    this.hasSpawned = false;

    this.spawned();
  }
  spawned() {
    if (this.type == Game.EnemyTypes.SPLITTED) {
      this.hasSpawned = true;
      return;
    }

    if (this.type == Game.EnemyTypes.BOUNCER) {
      this.y /= 2.0;
    }

    setTimeout(() => {
      this.hasSpawned = true;
      this.canShoot = this.type == Game.EnemyTypes.SHOOTER;
    }, 1000.0);
  }
  bounce() {
    if (this.type != Game.EnemyTypes.BOUNCER) return;

    if (this.x > width - this.size / 2.0 || this.x < this.size / 2) {
      this.dirX *= -1;
    }

    let spd = this.maxSpeed;
    let fallFactor = 1.0 / 64.0;

    // TODO issues with bouncer when exitting slowMode
    if (this.slow){
      spd /= 8.0;
      fallFactor /= 8.0;
    }

    this.x += this.dirX * spd;
    this.accel += 9.8;
    this.y += this.accel * fallFactor;

    if (this.y > height - this.size / 2) {
      // TODO issue when exiting slowness item
      this.accel -= this.accel * 2.0;
    }
  }
  
  moveAwayItemCollected(x, y){
    if (this.type == Game.EnemyTypes.BOUNCER) return;
    let dx = x - this.x;
    let dy = y - this.y;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance > 0){
      dx /= distance;
      dy /= distance;

      let spd = 80.0;

      this.x -= dx * spd;
      this.y -= dy * spd;
    }
  }
  moveTowardPlayer() {
    if (
      this.player == null ||
      !this.followPlayer ||
      this.type == Game.EnemyTypes.BOUNCER
    )
      return;

    let dx = this.player.x - this.x;
    let dy = this.player.y - this.y;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      dx /= distance;
      dy /= distance;
      let spd = this.maxSpeed * (1.0 - (this.health / (Game.healthFactor + 10.0)));
      if (this.type == Game.EnemyTypes.SPRINTER) {
        spd *= 3.0;
      }
      if (this.slow){
        spd /= 4.0;
      }
      this.x += dx * spd;
      this.y += dy * spd;
    }
  }
  spawnBullets() {
    // spawnSpikes
    if (!this.canShoot && this.type != Game.EnemyTypes.SHOOTER) return false;

    let factor = 0.0;
    if (this.slow){
      factor = this.slowShootingSpdFactor;
    } else {
      factor = this.shootingSpdFactor;
    }

    if (millis() - this.lastShotTime > factor * 1000) {
      this.lastShotTime = millis();
      return true; // ready to fire
    }
    return false;
  }
  update() {
    this.size = this.getSize();

    if (!this.hasSpawned) return;

    this.bounce();
    this.moveTowardPlayer();
  }
  show() {
    rectMode(CENTER);

    if (!this.isHit){
      switch (this.type) {
        case Game.EnemyTypes.NORMAL:
          this.col = [255, 255, 255];
          break;
  
        case Game.EnemyTypes.SPLITTER:
          this.col = [0, 255, 0];
          break;
  
        case Game.EnemyTypes.SPLITTED:
          this.col = [255 / 4, 255 / 4, 255 / 4];
          break;
  
        case Game.EnemyTypes.SHOOTER:
          this.col = [255, 0, 0];
          break;
  
        case Game.EnemyTypes.EXPLODER:
          this.col = [
            255 * (this.initialHealth / this.health),
            255 * (this.initialHealth / this.health),
            0
          ];
          break;
  
        case Game.EnemyTypes.BOUNCER:
          this.col = [0, 0, 255];
          break;
  
        case Game.EnemyTypes.REFLECTOR:
          this.col = [100, 255, 100];
          break;
      }
    }

    fill(...this.col);

    circle(this.x, this.y, this.size);

    fill(255);
    stroke(0);
    textSize(40.0);
    textAlign(CENTER);

    text(`${this.health}`, this.x, this.y);
  }
  getSize() {
    if (this.type == Game.EnemyTypes.EXPLODER) {
      return 160.0 - this.health * 3.0;
    }
    return 80.0 + this.health * 5.0;
  }
  hit(hitX = 0, hitY = 0, hitpoint = 1) {
    // if (!this.hasSpawned) return;

    let hitTime = 0.05;
    this.isHit = true;
    
    this.col[0] *= 0.65;
    this.col[1] *= 0.65;
    this.col[2] *= 0.65;

    this.health -= hitpoint;
    this.knockback(hitX, hitY);

    setTimeout(() => {
      this.isHit = false;
    }, hitTime * 1000.0);
  }
  
  knockback(hitX, hitY) {
    if (this.type == Game.EnemyTypes.BOUNCER) return;

    let strength = 6.0;

    this.x += strength * hitX;
    this.y += strength * hitY;
  }
  hasDied() {
    return this.health < 1;
  }
  toString() {
    return `${this.health}, ${this.x}, ${this.y}`;
  }
}
