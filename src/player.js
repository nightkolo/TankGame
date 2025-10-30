class Tank {
  constructor() {
    this.x = 0.0;
    this.y = 0.0;
    this.size = 50.0;
    this.enemies = [];
    this.powerups = [];

    this.lives = 5;
    this.newLives = 0;
    this.alive = true;
    this.invincible = false;
    this.invincibilityTime = 1.0;
  }
  gainLives(lives = 1){
    this.lives += lives;
    this.newLives += lives;
  }
  gainItem(item, itemCooldown = 8.0) { // Game.Items, float
    print("Item added!");

    this.powerups.push(item);
    
    print(this.powerups);

    if (item != Game.Items.SPIKE_SPRINKER){
      setTimeout(() => {
      this.loseItem(item);
      }, itemCooldown * 1000.0);
    }
  }
  loseItem(item) {
    print("Item removed!");
    
    Game.removeObject(this.powerups, item);
    print(this.powerups);
    // print(this.items);

  }
  hit() {
    if (this.invincible) return;

    print("Ouch!");

    this.lives--;

    if (this.lives < 1) {
      this.die();
    }

    this.invincible = true;
    setTimeout(() => {
      this.invincible = false;
    }, this.invincibilityTime * 1000.0);
  }
  die() {
    this.alive = false;
    print("Game over!");
  }
  insideAnEnemy(checkForSpawn = true) {
    if (this.enemies.length == 0) return false;

    if (!this.enemies[0].canHurt && checkForSpawn) return false;

    return this.enemies.some((e) =>
      GameMath.circleRectCollision(
        e.x,
        e.y,
        e.size/2.6,
        this.x,
        this.y,
        this.size,
        this.size
      )
    );
  }
  update() {
    this.x = mouseX;
    this.y = mouseY;
  }
  show() {
    if (this.invincible) {
      fill(255 / 2, 255 / 2, 200 / 2);
    } else {
      fill(255, 255, 200);
    }

    square(this.x, this.y, this.size);

    fill(255);
    stroke(0);
    textSize(25.0);
    textAlign(CENTER);

    text(`${this.lives}`, this.x, this.y + 8.0);
  }
}