class Enemy {
  #lastShotTime;
  #initialY;
  #initialHealth;
  #player;
  #slowState

  constructor({
    x = 200,
    y = 200,
    health = 10,
    maxSpeed = Game.defaultEnemySpeed,
    type = Game.EnemyTypes,
    followPlayer = true,
    player,
  } = {}) {
    this.x = x;
    this.y = y;
    this.#initialY = y / 2.0;
    
    // show
    this.size = this.getSize();
    this.dpSize = this.getSize(); // displaySize
    this.dpSizeX = this.getSize();
    this.dpSizeX = this.getSize();
    
    // Stats
    this.maxSpeed = maxSpeed;
    this.health = health;
    this.points = round(health / 4.0); // experimental
    this.#initialHealth = health;
    this.#player = player;
    
    // Type
    this.type = type;

    // Assets
    this.imgEyes = this.getEyes();
    this.eyeX = 0.0;
    this.eyeY = 0.0;

    // Bouncer
    this.accel = 0.0;
    this.grav = 9.8;
    this.dirX = Math.sign(random() - 0.5);

    // Item
    this.slow = false;

    // State
    this.canMove = false;
    this.canHurt = false;

    // Misc.
    this.col = [0, 0, 0, 255];
    this.followPlayer = followPlayer;
    this.canShoot = false;
    this.isHit = false;
    this.shootingSpdFactor = 1.7;
    this.#lastShotTime = 0;
    this.#slowState = false;

    this.spawned();
  }
  getEyes(){
    let img;
    switch (this.type) {
      case Game.EnemyTypes.NORMAL:
        img = loadImage("img/enemy-eyes-normal-01.svg");
        break;

      // case Game.EnemyTypes.SPLITTER:
      //   this.col = [0, 255, 0, alpha];
      //   break;

      // case Game.EnemyTypes.SPLITTED:
      //   this.col = [255 / 4, 255 / 4, 255 / 4, alpha];
      //   break;

      case Game.EnemyTypes.SHOOTER:
        img = loadImage("img/enemy-eyes-shooter-01.svg");
        break;

      // case Game.EnemyTypes.EXPLODER:
      //   this.col = [
      //     255 * (this.#initialHealth / this.health),
      //     255 * (this.#initialHealth / this.health),
      //     0, alpha];
      //   break;

      case Game.EnemyTypes.BOUNCER:
        img = loadImage("img/enemy-eyes-rabbitball-01.svg");
        break;

      default:
        img = loadImage("img/enemy-eyes-normal-01.svg");
        break;
    }
  return img;
  }
  getInitialHealth(){
    return this.#initialHealth;
  }
  spawned() {
    // TODO of type SPITTER should continue moving
    switch (this.type){
      case Game.EnemyTypes.BOUNCER:
        this.y /= 2.0;
        break;
    }

    setTimeout(() => {
      this.canMove = true;
      this.canHurt = true;
      this.canShoot = this.type == Game.EnemyTypes.SHOOTER;
    }, 1000.0);
  }
  returnBounce(){
    if (this.type == Game.EnemyTypes.BOUNCER) {
      this.y = this.#initialY;
      this.accel = 0.0;
      this.canMove = true;
      this.canHurt = false;

      setTimeout(() => {
        this.canHurt = true;
      }, 1000.0);
    }
  }
  bounce() {
    if (this.type != Game.EnemyTypes.BOUNCER) return;

    if (this.x > width - this.size / 2.0 || this.x < this.size / 2) {
      this.dirX *= -1;
    }

    let spd = this.maxSpeed;
    let fallFactor = 1.0 / 64.0;

    if (this.slow){
      spd /= 8.0;
      fallFactor /= 8.0;
      this.#slowState = true;
    } else if (this.#slowState) {
      this.returnBounce();
      
      this.#slowState = false;
    }

    this.x += this.dirX * spd;
    this.accel += 9.8;
    this.y += this.accel * fallFactor;

    if (this.y > height - this.size / 2) {
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
      this.#player == null ||
      !this.followPlayer ||
      this.type == Game.EnemyTypes.BOUNCER
    )
      return;

    let dx = this.#player.x - this.x;
    let dy = this.#player.y - this.y;
    let distance = sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      dx /= distance;
      dy /= distance;
      let spd = this.maxSpeed * (1.0 - (this.health / (Game.enemyHealthFactor + 10.0)));
      if (this.type == Game.EnemyTypes.SPRINTER) {
        spd *= 3.33;
      }
      if (this.slow){
        spd /= 4.0;
      }
      this.x += dx * spd;
      this.y += dy * spd;
    }
  }
  spawnBullets() {
    if (!this.canShoot && this.type != Game.EnemyTypes.SHOOTER) return false;

    let factor = 0.0;
    if (this.slow){
      factor = this.shootingSpdFactor * 4.0;
    } else {
      factor = this.shootingSpdFactor;
    }

    if (millis() - this.#lastShotTime > factor * 1000) {
      this.#lastShotTime = millis();
      return true; // ready to fire
    }
    return false;
  }
  update() {
    this.size = this.getSize();
    this.dpSize = this.getSize();
    this.dpSizeX = this.getSize();
    this.dpSizeY = this.getSize();
    
    this.eyeX = this.x + ((this.#player.x - this.eyeX) / 25.0);
    this.eyeY = this.y + ((this.#player.y - this.eyeY) / 25.0);

    if (!this.canMove) return;

    this.bounce();
    this.moveTowardPlayer();
  }
  show() {
    rectMode(CENTER);

    let alpha = 255;
    if (!this.canHurt){
      // alpha = 255/2;
    }

    if (!this.isHit){
      switch (this.type) {
        case Game.EnemyTypes.NORMAL:
          this.col = [200, 200, 200, alpha];
          break;
  
        case Game.EnemyTypes.SPLITTER:
          this.col = [0, 255, 0, alpha];
          break;
  
        case Game.EnemyTypes.SPLITTED:
          this.col = [255 / 4, 255 / 4, 255 / 4, alpha];
          break;
  
        case Game.EnemyTypes.SHOOTER:
          this.col = [255, 0, 0, alpha];
          break;
  
        case Game.EnemyTypes.EXPLODER:
          this.col = [
            255 * (this.#initialHealth / this.health),
            255 * (this.#initialHealth / this.health),
            0, alpha];
          break;
  
        case Game.EnemyTypes.BOUNCER:
          this.col = [0, 0, 255, alpha];
          break;
  
        case Game.EnemyTypes.REFLECTOR:
          this.col = [100, 255, 100, alpha];
          break;
      }
    }

    fill(...this.col);

  let imgSize = 68.0;

  // TODO refactor
  switch (this.type) {
      case Game.EnemyTypes.NORMAL:
        break;

      case Game.EnemyTypes.SPLITTER:
        circle(this.x + (this.size/3), this.y + (this.size/4), this.size/2);
        circle(this.x - (this.size/3), this.y + (this.size/4), this.size/2);
        ellipse(this.x, this.y, this.dpSizeX, this.dpSizeY);
        break;

      case Game.EnemyTypes.SPLITTED:
        circle(this.x + (this.size/3), this.y, this.size/2);
        circle(this.x - (this.size/3), this.y, this.size/2);
        ellipse(this.x, this.y, this.dpSizeX, this.dpSizeY);
        break;

      case Game.EnemyTypes.SHOOTER:
        imgSize = 108.0;

        rect(this.x + this.size/3.4, this.y, this.size/2, this.size/3);
        rect(this.x - this.size/3.4, this.y, this.size/2, this.size/3);
        rect(this.x, this.y + this.size/3.4, this.size/3, this.size/2);
        rect(this.x, this.y  - this.size/3.4, this.size/3, this.size/2);
        ellipse(this.x, this.y, this.dpSizeX, this.dpSizeY);
        break;

      case Game.EnemyTypes.EXPLODER:
        //
        break;

      case Game.EnemyTypes.BOUNCER:
        ellipse(this.x + (this.size/3.5), this.y - (this.size/5), this.size/2, this.size);
        ellipse(this.x - (this.size/3.5), this.y - (this.size/5), this.size/2, this.size);
        ellipse(this.x, this.y, this.dpSizeX, this.dpSizeY);
        break;

      case Game.EnemyTypes.REFLECTOR:
        let t = millis() / 800.0;

        let distance = this.dpSize/2.6;

        let animX1 = sin(t) * distance;
        let animY1 = cos(t) * distance;
        
        let animX2 = sin(t + (PI / 2)) * distance;
        let animY2 = cos(t + (PI / 2)) * distance;
        
        let animX3 = sin(t + PI) * distance;
        let animY3 = cos(t + PI) * distance;

        let animX4 = sin(t + ((PI * 3) / 2)) * distance;
        let animY4 = cos(t + ((PI * 3) / 2)) * distance;
        
        circle(this.x + animX1, this.y + animY1, this.size/2.0);
        circle(this.x + animX2, this.y + animY2, this.size/2.0);
        circle(this.x + animX3, this.y + animY3, this.size/2.0);
        circle(this.x + animX4, this.y + animY4, this.size/2.0);
        ellipse(this.x, this.y, this.sizeX, this.sizeY);
        break;
    }

    circle(this.x, this.y, this.size);

    // TODO mask
    this.imgEyes.resize(imgSize + this.health * 2.0, 0);
    image(this.imgEyes, this.eyeX, this.eyeY);

    fill(255);
    textSize(40.0);
    textAlign(CENTER);

    text(`${this.health}`, this.x, this.y - 20.0);
  }
  getColor(){
    
  }
  getSize() {
    if (this.type == Game.EnemyTypes.EXPLODER) {
      return 160.0 - this.health * 3.0;
    }
    return 80.0 + this.health * 5.0;
  }
  hit(hitX = 0, hitY = 0, hitpoint = 1) {
    let hitTime = 0.05;
    this.isHit = true;
    
    // TODO store colors in a const to manipulate
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
  toString(){
    return `${round(this.x)}, ${round(this.y)}`
  }
}
