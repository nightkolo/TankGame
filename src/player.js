class Player {
  // Tank
  constructor() {
    this.x = 0.0;
    this.y = 0.0;
    this.size = 50.0;
    this.enemies = [];
    this.powerups = [];

    this.lives = 5;
    this.newLives = 0;
    this.alive = true;
    this.invincinble = false;
    this.iframeTime = 1.0;

    // Powerups
    // this.two_axis_shooting = false;
    // this.variable_shooting = false;
    // this.slowness = false;
  }
  gainLives(lives = 1){
    this.lives += lives;
    this.newLives += lives;
  }
  gainItem(item, itemCooldown = 5.0) {
    // switch (item) {
    //   case Game.Items.VARIABLE_SHOOTING:
    //     // this.variable_shooting = true;
    //     break;
    //   case Game.Items.TWO_AXIS_SHOOTING:
    //     // this.two_axis_shooting = true;
    //     break;
    //   case Game.Items.SLOWNESS:
    //     // this.slowness = true;
    //     break;
    // }
    
    print("Item added!");
    this.powerups.push(item);
    print(this.powerups);

    // TODO improve cooldown system
    setTimeout(() => {
      this.stopItemEffect(item);
    }, itemCooldown * 1000.0);
  }
  stopItemEffect(item) {
    // switch (item) {
    //   case Game.Items.TWO_AXIS_SHOOTING:
    //     this.two_axis_shooting = false;
    //     break;
    //   case Game.Items.VARIABLE_SHOOTING:
    //     this.variable_shooting = false;
    //     break;
    //   case Game.Items.SLOWNESS:
    //     this.slowness = false;
    //     break;
    // }

    print("Item removed!");
    print(this.powerups);
    const index = this.powerups.indexOf(item);
    if (index > -1) {
      this.powerups.splice(index, 1);
    }
  }
  hit() {
    if (this.invincinble) return;

    print("Ouch!");

    this.lives--;

    if (this.lives < 1) {
      this.die();
    }

    this.invincinble = true;
    setTimeout(() => {
      this.invincinble = false;
    }, this.iframeTime * 1000.0);
  }
  die() {
    // TODO Player death incomplete
    this.alive = false;
    print("Game over!");
  }
  insideAnEnemy(checkForSpawn = true) {
    if (this.enemies.length == 0) return false;

    if (!this.enemies[0].hasSpawned && checkForSpawn) return false;

    return this.enemies.some((e) =>
      TankMath.circleRectCollision(
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
    if (this.invincinble) {
      fill(255 / 2, 255 / 2, 200 / 2);
    } else {
      fill(255, 255, 200);
    }

    // TODO make into square
    // circle(this.x, this.y, this.size);
    square(this.x, this.y, this.size);

    fill(255);
    stroke(0);
    textSize(25.0);
    textAlign(CENTER);

    text(`${this.lives}`, this.x, this.y + 8.0);
  }
}
