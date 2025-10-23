class Enemy {
  // Cacti
  constructor({
    x = 200,
    y = 200,
    health = 10,
    speed = 1.35,
    type = Game.EnemyTypes,
    followPlayer = true,
    player,
  } = {}) {
    this.x = x;
    this.y = y;

    // Stats
    this.size = this.getSize();
    this.speed = speed;
    this.health = health;
    this.initialHealth = health;
    this.points = round(health / 4.0);
    this.player = player;

    // Type
    this.type = type;

    // Bouncer
    this.accel = 0.0;
    this.grav = 9.8;
    this.dirX = Math.sign(random() - 0.5);
    this.h = y / 2.0;

    // Misc.
    this.followPlayer = followPlayer;
    this.lastShotTime = 0;
    this.canShoot = false;
    this.shootingSpdFactor = 1.25;
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

    this.x += this.dirX * this.speed;

    this.accel += 9.8;
    this.y += this.accel * (1.0 / 64.0);

    if (this.y > height - this.size / 2) {
      this.accel -= this.accel * 2.0;
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
      let spd = this.speed;
      if (this.type == Game.EnemyTypes.SPRINTER) {
        spd *= 3.0;
      }
      this.x += dx * spd;
      this.y += dy * spd;
    }
  }
  spawnBullets() {
    // spawnSpikes
    if (!this.canShoot && this.type != Game.EnemyTypes.SHOOTER) return false;

    if (millis() - this.lastShotTime > this.shootingSpdFactor * 1000) {
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

    switch (this.type) {
      case Game.EnemyTypes.NORMAL:
        fill(255);
        break;
      case Game.EnemyTypes.SPLITTER:
        fill(0, 255, 0);
        break;
      case Game.EnemyTypes.SPLITTED:
        fill(255 / 4, 255 / 4, 255 / 4);
        break;
      case Game.EnemyTypes.SHOOTER:
        fill(255, 0, 0);
        break;
      case Game.EnemyTypes.EXPLODER:
        fill(
          255 * (this.initialHealth / this.health),
          255 * (this.initialHealth / this.health),
          0
        );
        break;
      case Game.EnemyTypes.BOUNCER:
        fill(0, 0, 255);
        break;
      case Game.EnemyTypes.REFLECTOR:
        fill(100, 255, 100);
        break;
    }

    circle(this.x, this.y, this.size);

    fill(255);
    // strokeWeight(5);
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

    this.health -= hitpoint;
    this.knockback(hitX, hitY);
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
