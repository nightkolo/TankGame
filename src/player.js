class Tank {
  constructor() {
    this.x = 0.0;
    this.y = 0.0;
    this.size = 50.0;
    this.dpSize = 50.0;
    
    // Game.currentEnemies = [];
    this.powerups = [];
    this.tankBuddiesOwned = 0;
    this.curBulletDir = {
      x: 0,
      y: -1,
    }

    // Assets
    this.img = loadImage('img/tank-eyes-01.svg');
    this.imgHit = loadImage('img/tank-eyes-01.svg');
    this.imgHeart = loadImage('img/heart-02.svg');
    this.imgHeart1 = loadImage('img/heart-01.svg');
    // Audio
    this.hitSFX = new Howl({ src: "audio/tank_hit_01.ogg", volume: 0.5});
    this.criticalHealthSFX = new Howl({src: "audio/tank_hearts_critical.ogg", volume: 0.5});
    this.gameoverSFX = new Howl({
      src: ['audio/game_end.ogg'],
      volume: 0.2
    });
    this.itemFinishedSFXs = [
      new Howl({ src: ['audio/item_timeout_01.ogg'], volume: 0.4, stereo: 0 }),
      new Howl({ src: ['audio/item_timeout_02.ogg'], volume: 0.4, stereo: 0 })
    ];

    this.lives = 3;
    this.floatingHearts = 0;
    this.alive = true;
    this.invincible = false;
    this.invincibilityTime = 1.0;
    this.trail = [];
    this.maxTrailLength = 50;
    this.mouseDirX = 0;
    this.mouseDirY = 0;
    this.prevMouseX = mouseX;
    this.prevMouseY = mouseY;
  }
  gainLives(lives = 1){
    this.lives += lives;
    this.floatingHearts++;
    
    this.lives = min(15, this.lives);
  }
  gainItem(item, itemCooldown = 8.0) { // Game.Items, float
    this.powerups.push(item);
    
    // print(this.powerups);

    if (item.type == Game.ItemType.DEFAULT){
      Game.startItemTimer(item, itemCooldown);

      setTimeout(() => {
      this.loseItem(item);
      }, itemCooldown * 1000.0);
    } else {

      if (item == Game.Items.TANK_BUDDY){
        this.tankBuddiesOwned++;
        Game.setItemTimer(item, this.tankBuddiesOwned);
      }
    }
  }
  loseItem(item) {
    this.itemFinishedSFXs[floor(random() * this.itemFinishedSFXs.length)].play();

    Game.removeObject(this.powerups, item);
    print(this.powerups);
  }
  hit() {
    if (this.invincible || !this.alive) return;

    print("Ouch!");

    this.hitSFX.play();

    this.lives--;
    this.floatingHearts = 0;

    if (this.lives < 1) {
      this.gameoverSFX.play();
      this.die();
    } else if (this.lives < 2){
      this.criticalHealthSFX.play();
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
    if (Game.currentEnemies.length == 0) return false;

    if (!Game.currentEnemies[0].canHurt && checkForSpawn) return false;

    return Game.currentEnemies.some((e) =>
      GameMath.circleRectCollision(
        e.x,
        e.y,
        e.size.real/2.6,
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

    // Track mouse movement direction
    let dx = mouseX - this.prevMouseX;
    let dy = mouseY - this.prevMouseY;

    this.mouseDirX = dx === 0 ? this.mouseDirX : (dx > 0 ? 1 : -1);
    this.mouseDirY = dy === 0 ? this.mouseDirY : (dy > 0 ? 1 : -1);

    this.prevMouseX = mouseX;
    this.prevMouseY = mouseY;

    // console.log(this.trail);
    // Store trail positions
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }
  show() {
    // Draw following circles based on floatingHearts
    let steps = floor(this.trail.length / max(1, this.floatingHearts * 4));

    for (let i = 1; i <= min(5, this.floatingHearts); i++) {
      let index = this.trail.length - 1 - i * steps;

      if (index >= 0) {
        let p = this.trail[index];
        noStroke();
        fill(255, 255, 255, 120);
        image(this.imgHeart1, p.x + (i * 15.0 * -this.mouseDirX), p.y + (i * 5.0 * -this.mouseDirY));
      }
    }

    if (this.invincible) {
      fill(255 / 2, 125 / 2, 0 / 2);
    } else {
      fill(255, 125, 125);
    }

    imageMode(CENTER);
    
    stroke(90, 0, 0)
    square(this.x, this.y, this.dpSize, this.dpSize/10.0);
  
    image(this.img, this.x + 5.0, this.y)

    let flash = 1
    if (this.lives === 1){
      flash = map(sin(millis() * 0.03), -1, 1, 0.5, 1);
    } else if (this.lives === 2){
     flash = map(sin(millis() * 0.015), -1, 1, 0.5, 1);
    }
    
    tint(255 * flash, 255 * flash, 255 * flash);
    image(this.imgHeart, this.x, this.y - 60.0);

    fill(255);
    stroke(0);
    textSize(25.0);
    textAlign(CENTER);

    if (this.lives == 15){
      textLeading(21)
      text(`${this.lives}\nMax`, this.x, this.y - 54.0);
    } else {
      text(`${this.lives}`, this.x, this.y - 54.0);
    }
    tint(255,255,255);
  }
}