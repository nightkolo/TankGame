class Item {
  #openState;

  constructor(x, y, item, player, cooldown = Game.powerupTime) {
    this.x = x;
    this.y = y;
    this.itemType = item;
    this.player = player;
    this.enemies = [];
    this.col = [];
    
    this.size = 50.0;
    this.img = loadImage('img/question.svg');
    this.imgEyes = loadImage('img/bomb-eyes.svg');

    this.hitsToOpen = 15;
    this.cooldown = cooldown;

    this.moveX = random() > 1 / 2;
    this.dir = Math.sign(random() - 0.5);
    this.spd = 1.125;

    this.opened = false;
    this.collected = false;

    this.#openState = false;
  }
  isOpen() {
    return this.hitsToOpen < 1;
  }
  hit() {
    if (this.opened) return;

    this.hitsToOpen--;

    if (this.hitsToOpen < 1) {
      this.opened = true;
    }
  }
  grantItem() {
    if (this.collected) return;

    this.collected = true;
    this.player.gainLives();

    if (this.itemType.type != Game.ItemType.INSTANT){
      this.player.gainItem(this.itemType, this.cooldown);
    } else {
      // Switch

      if (this.itemType == Game.Items.BOMB){
        Game.dropBomb(this.x, this.y);
      }
    }

    Game.itemCollected(this.itemType);

    // print(`Item gained: ${Game.getItemName(this.item)}`);

    this.enemies.forEach((e) => {
      e.moveAwayItemCollected(this.x, this.y);
    })
  }
  update() {
    if (!this.opened) {
      if (this.moveX) {
        this.x += this.spd * this.dir;
      } else {
        this.y += this.spd * this.dir;
      }
    } else if( this.itemType.type == Game.ItemType.INSTANT ) {
      this.grantItem();
    } else if (
      GameMath.circleCollision(
        this.x,
        this.y,
        this.size / 2,
        this.player.x,
        this.player.y,
        this.player.size / 2
      ) &&
      !this.collected
    ) {
      this.grantItem();
    }
  }
  show() {
    switch (this.itemType){
      case Game.Items.COUNTER_SPIKE:
        this.col = [255,0,0];
        break;
      case Game.Items.INACCURACY:
        this.col = [0,255,0];
        break;
      case Game.Items.TANK_BUDDY:
        this.col = [255,0,255];
        break;
      case Game.Items.DAZZLE:
        this.col = [255,255,255];
        break;
      case Game.Items.BOMB:
        // this.col = [25,25,25];
        break;
    }

    fill(this.col[0], this.col[1], this.col[2])
    circle(this.x, this.y, this.size);
    stroke(0);
    textSize(20.0);
    textAlign(CENTER);

    fill(255);

    if (!this.opened){
      if (this.itemType == Game.Items.BOMB){
        image(this.imgEyes, this.x, this.y);
        this.size = 60.0;

        this.col[0] = (1.0 - (this.hitsToOpen / 15.0)) * 175;
        this.col[1] = 25;
        this.col[2] = 25;
        
      } else {
        image(this.img, this.x, this.y);
        
      }

      text(`${this.hitsToOpen}`, this.x, this.y+50.0);

    } else {
      text("! ! !", this.x, this.y);
    }

    if (this.opened && !this.#openState){
      setTimeout(() => {
        this.collected = true;
      }, this.cooldown * 1000.0);
      this.#openState = true;
    }
  }
}
class Bomb {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.hitRadius = 440.0;
    this.hasExploded = false;
    this.isExploding = false;

    this.hitPower = 30;
    this.lifetime = 1.0;
  }
  update(){}
  show(){
    fill(125, 125, 125, 50);
    circle(this.x, this.y, 2.0 * this.hitRadius);
  }
  animExplode(enemies = []){
    // console.log(enemies);
    animScreenShake(2500.0, 1.0);

    enemies.forEach((e) => {
      if (GameMath.circleCollision(this.x, this.y, this.hitRadius, e.x, e.y, e.size)){
        const hitStrength = 1.0 - (GameMath.distance(this.x, this.y, e.x, e.y) / (2.0 * this.hitRadius));
        // console.log(hitStrength);

        e.hit(0, 0, floor(this.hitPower * hitStrength));

        if (e.hasDied()){
          enemyDied(e, new Bullet(this.x, this.y));
        }
      }
    })

    setTimeout(() => {
      this.hasExploded = true;
    }, this.lifetime * 1000.0);
  }
  explode(enemies = []){
    if (!this.isExploding){
      this.animExplode(enemies);
      this.isExploding = true;
    }
  }
}

class TankBuddy{
  #start
   
  constructor(x, y, shootSpd /*, shootingDir*/){
    this.x = x;
    this.y = y;
    this.size = 50.0;

    this.shootingSpdFactor = shootSpd;
    this.lastShotTime = 0.0;
    this.lifetime = Game.tankBuddyLifetime;
    this.#start = 0.0;
    this.alive = true;

    this.img = loadImage('img/buddy-eyes.svg');

    this.spawned(); 
  }
  spawned(){
    this.#start = millis();

    setTimeout(() => {
      this.alive = false;
    }, this.lifetime * 1000.0)
  }
  spawnBullets() {
    if (millis() - this.lastShotTime > this.shootingSpdFactor * 1000) {
      this.lastShotTime = millis();
      return true; // ready to fire
    }
    return false;
  }
  getTimeLeft(){
    return Game.tankBuddyLifetime - ((millis() - this.#start) / 1000.0);
  }
  update(){
  }
  show(){
    square(this.x, this.y, this.size, this.size/8.0);

    fill(255);
    stroke(0);
    textSize(25.0);
    textAlign(CENTER);

    this.timeLeft = Game.tankBuddyLifetime - ((millis() - this.start) / 1000.0)

    image(this.img, this.x, this.y)

    text(`${this.getTimeLeft().toFixed(1)}`, this.x, this.y + 50.0);
  }
}
