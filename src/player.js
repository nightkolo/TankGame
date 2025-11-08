// let img;

// import { Howl } from "./libraries/howler.core";

// function preload(){
//   img = loadImage('img/tank-01.png');
// }

class Tank {
  constructor() {
    this.x = 0.0;
    this.y = 0.0;
    this.size = 50.0;
    this.dpSize = 50.0;
    
    this.enemies = [];
    this.powerups = [];
    this.curBulletDir = {
      x: 0,
      y: -1,
    }

    // Assets
    this.img = loadImage('img/tank-eyes-01.svg');
    // TODO Audio
    this.hitSFXs = [
      new Howl({ src: "audio/tank_hit_01.ogg", volume: 0.5})
      // loadSound("audio/tank_hit_01.ogg")
    ];
    this.criticalHealthSFX = new Howl({
      src: "audio/tank_hearts_critical.ogg", volume: 0.5
    });

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
    // print("Item added!");

    this.powerups.push(item);
    
    print(this.powerups);

    if (item != Game.Items.SPIKE_SPRINKER){
      setTimeout(() => {
      this.loseItem(item);
      }, itemCooldown * 1000.0);
    }
  }
  loseItem(item) {
    // print("Item removed!");
    
    Game.removeObject(this.powerups, item);
    print(this.powerups);
    // print(this.items);

  }
  hit() {
    if (this.invincible || !this.alive) return;

    print("Ouch!");

    // this.hitSFXs[floor(this.hitSFXs.length * random())].play();

    this.lives--;

    if (this.lives < 2){
      this.criticalHealthSFX.play();
    }
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
      fill(255 / 2, 125 / 2, 0 / 2);
    } else {
      fill(255, 125, 125);
    }
    // Placeholder assets
    // if (this.curBulletDir.x > 0){
    //   image(this.imgGunR, this.x + 33.0, this.y);

    // } else if (this.curBulletDir.x < 0){
    //   image(this.imgGunL, this.x - 33.0, this.y);

    // } else if (this.curBulletDir.y > 0){
    //   image(this.imgGunD, this.x, this.y + 33.0);
      
    // } else if (this.curBulletDir.y < 0){
    //   image(this.imgGunU, this.x, this.y - 33.0); 
    // }

    imageMode(CENTER);
    // image(this.img, this.x, this.y, this.size, this.size);
    // square(this.x - (this.size/2.5), this.y, this.size/2.0);
    // square(this.x + (this.size/2.5), this.y, this.size/2.0);
    // square(this.x, this.y - (this.size/2.5), this.size/2.0);
    // square(this.x, this.y + (this.size/2.5), this.size/2.0);
    
    stroke(90, 0, 0)
    square(this.x, this.y, this.dpSize, this.dpSize/10.0);
  
    // image(this.img, this.x + 5.0, this.y)

    fill(255);
    stroke(0);
    textSize(25.0);
    textAlign(CENTER);

    text(`${this.lives}`, this.x, this.y - 54.0);
  }
}