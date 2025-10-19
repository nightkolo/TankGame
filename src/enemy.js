class Enemy {
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
    this.points = round(health / 4.0);
    this.player = player;

    // Type
    this.type = type;

    // Misc.
    this.followPlayer = followPlayer;
    this.lastShotTime = 0;
    this.canShoot = false;
    this.shootingSpdFactor = 1.25;
    this.hasSpawned = false;

    this.spawned();
  }
  spawned() {
    setTimeout(() => {
      this.hasSpawned = true;
      this.canShoot = this.type == Game.EnemyTypes.SHOOTER;
    }, 1000.0);
  }
  moveTowardPlayer() {
    if (this.player == null || !this.followPlayer) return;

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

    this.moveTowardPlayer();
  }
  show() {
    rectMode(CENTER);

    switch (this.type) {
      case Game.EnemyTypes.NORMAL:
        fill(255);
        break;
      case Game.EnemyTypes.SHOOTER:
        fill(255, 0, 0);
        break;
      case Game.EnemyTypes.EXPLODER:
        fill(255, 255, 0);
        break;
      case Game.EnemyTypes.SPRINTER:
        fill(0, 0, 255);
        break;
      case Game.EnemyTypes.REFLECTOR:
        fill(100, 255, 100);
        break;
    }

    circle(this.x, this.y, this.size);

    fill(255);
    strokeWeight(5);
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
