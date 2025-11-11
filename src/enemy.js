class Enemy {
  #lastShotTime = 0.0;
  #initialY;
  #initialHealth;
  #player;
  #slowState = false;
  #hitState = false;
  #lastHitTime = 0.0;

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
    this.dpSizeY = this.getSize();
    
    // Stats
    this.maxSpeed = maxSpeed;
    this.health = health;
    this.points = round(health / 4.0); // experimental
    this.#initialHealth = health;
    
    // Type
    this.type = type;
    
    // Assets
    this.bounceSFX = new Howl({ src: "audio/enemy_rabbitball_bounce.ogg", volume: 0.5});
    this.shootSFXs = [
      new Howl({ src: "audio/enemy_shooter_shoot_01.ogg", volume: 0.5}),
      new Howl({ src: "audio/enemy_shooter_shoot_02.ogg", volume: 0.5}),
      new Howl({ src: "audio/enemy_shooter_shoot_03.ogg", volume: 0.5}),
      new Howl({ src: "audio/enemy_shooter_shoot_04.ogg", volume: 0.5}),
      new Howl({ src: "audio/enemy_shooter_shoot_05.ogg", volume: 0.5})
    ];
    this.imgEyes = this.getEnemyEyes();
    this.imgHitEyes = this.getEnemyEyesHit();
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
    
    // Animation
    this.t = 1.0;
    this.startX = 0;
    this.startY = 0;
    this.animatingBounce = false;
    
    // Misc.
    this.#player = player;
    this.col = [0, 0, 0];
    this.followPlayer = followPlayer;
    this.canShoot = false;
    this.isBeingHit = false;
    this.shootingSpdFactor = 1.7;
    
    this.spawned();
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
      this.exittedSlowMode();
      
      this.#slowState = false;
    }

    this.x += this.dirX * spd;
    this.accel += 9.8;
    this.y += this.accel * fallFactor;

    if (this.y > height - this.size / 2) {
      this.bounceSFX.play();
      animScreenShake();

      // TODO issue, make a fixed calculated value
      this.accel -= this.accel * 2.0;
    }
  }
  exittedSlowMode(){
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
      let aud = this.shootSFXs[floor(random() * this.shootSFXs.length)];
      // if (aud.isLoaded()){
      aud.play()
      // }

      this.#lastShotTime = millis();
      return true; // ready to fire
    }
    return false;
  }
  animBounce(sideHit = false){
    if (this.t < 0.5) return;

    if (sideHit){
      this.startX = this.dpSizeX - (this.dpSizeX / 3.5);
      this.startY = this.dpSizeY + (this.dpSizeY / 3.5);
    } else {
      this.startX = this.dpSizeX + (this.dpSizeX / 3.5);
      this.startY = this.dpSizeY - (this.dpSizeY / 3.5);
    }
    this.t = 0;
    this.animatingBounce = true;
  }
  update() {
    this.size = this.getSize();
    this.dpSize = this.getSize();
    this.dpSizeX = this.getSize();
    this.dpSizeY = this.getSize();
    
    if (this.isBeingHit){
      this.eyeX = this.x;
      this.eyeY = this.y;
    } else {
      this.eyeX = this.x + ((this.#player.x - this.eyeX) / 25.0);
      this.eyeY = this.y + ((this.#player.y - this.eyeY) / 25.0);
    }

    if (this.isBeingHit && millis() - this.#lastHitTime > 200) {
      this.isBeingHit = false;
    }

    if (!this.canMove) return;

    this.bounce();
    this.moveTowardPlayer();
  }
  show() {
    rectMode(CENTER);

    let imgSize = 68.0;
    
    fill(this.col[0], this.col[1], this.col[2], this.col[3]);

    if (!this.canHurt){
      this.col = this.getEnemyColor(5.0, 255/4);
      stroke(this.getEnemyColor());
      strokeWeight(10);
    } else {
      strokeWeight(5);

      if (!this.isBeingHit) {
        this.col = this.getEnemyColor();
        stroke(this.getEnemyColor(4.0));
      }

      switch (this.type) {
        case Game.EnemyTypes.NORMAL:
          break;

        case Game.EnemyTypes.SPLITTER:
          circle(this.x + (this.size/3), this.y + (this.size/4), this.size/2);
          circle(this.x - (this.size/3), this.y + (this.size/4), this.size/2);
          break;

        case Game.EnemyTypes.SPLITTED:
          circle(this.x + (this.size/3), this.y, this.size/2);
          circle(this.x - (this.size/3), this.y, this.size/2);
          break;

        case Game.EnemyTypes.SHOOTER:
          imgSize = 92.0;

          rect(this.x + this.size/3.4, this.y, this.size/2, this.size/3);
          rect(this.x - this.size/3.4, this.y, this.size/2, this.size/3);
          rect(this.x, this.y + this.size/3.4, this.size/3, this.size/2);
          rect(this.x, this.y  - this.size/3.4, this.size/3, this.size/2);
          break;

        case Game.EnemyTypes.EXPLODER:
          break;

        case Game.EnemyTypes.BOUNCER:
          ellipse(this.x + (this.size/3.5), this.y - (this.size/5), this.size/2, this.size);
          ellipse(this.x - (this.size/3.5), this.y - (this.size/5), this.size/2, this.size);
          break;

        case Game.EnemyTypes.REFLECTOR:
          let t = millis() / 800.0;
          let distance = this.dpSize/2.6;

          circle(
            this.x + (sin(t) * distance),
            this.y + (cos(t) * distance),
            this.size/2.0);
          circle(
            this.x + (sin(t + (PI / 2)) * distance),
            this.y + (cos(t + (PI / 2)) * distance),
            this.size/2.0);
          circle(
            this.x + (sin(t + PI) * distance),
            this.y + (cos(t + PI) * distance),
            this.size/2.0);
          circle(
            this.x + (sin(t + ((PI * 3) / 2)) * distance),
            this.y + (cos(t + ((PI * 3) / 2)) * distance),
            this.size/2.0);
          break;
      }
    } 

    // Animation
    if (this.animatingBounce) {
      this.t += 0.01;
      let eased = Anim.elasticEaseOut(constrain(this.t, 0, 1));
      let x = lerp(this.startX, this.dpSizeX, eased);
      let y = lerp(this.startY, this.dpSizeY, eased);

      ellipse(this.x, this.y, x, y);

      // stop when finished
      if (this.t >= 1) this.animatingBounce = false;
    } else {
      ellipse(this.x, this.y, this.dpSizeX, this.dpSizeY);
    }

    // TODO mask
    if (this.imgEyes != undefined && this.imgHitEyes != undefined){
      let size = imgSize + this.health * 2.0;

      if (this.isBeingHit){
        this.imgEyes.resize(imgSize + this.health * 2.0, 0);
        image(this.imgHitEyes, this.eyeX, this.eyeY);
      } else {
        this.imgEyes.resize(imgSize + this.health * 2.0, 0);
        image(this.imgEyes, this.eyeX, this.eyeY);
      }
    }

    fill(255);
    textSize(40.0);
    textAlign(CENTER);
    strokeWeight(5);
    stroke(0);

    text(`${this.health}`, this.x, this.y - 20.0);
  }
  hit(hitX = 0, hitY = 0, hitpoint = 1) {
    this.#lastHitTime = millis(); // record when last hit occurred
    this.isBeingHit = true;

    this.col[0] *= 0.65;
    this.col[1] *= 0.65;
    this.col[2] *= 0.65;

    this.animBounce(hitX !== 0 && hitY == 0);

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
  getSize() {
    if (this.type == Game.EnemyTypes.EXPLODER) {
      return 160.0 - this.health * 3.0;
    }
    return 80.0 + this.health * 5.0;
  }
  getInitialHealth(){
    return this.#initialHealth;
  }
  getEnemyEyesHit() {
    const options = [
      "img/enemy-eyes-hit-01.svg",
      "img/enemy-eyes-hit-02.svg",
      "img/enemy-eyes-hit-03.svg"
    ];

    const choice = floor(random(options.length)); // picks 0, 1, or 2
    const img = loadImage(options[choice]);

    return img;
  }
  getEnemyEyes(){
    let img;

    switch (this.type) {
      case Game.EnemyTypes.NORMAL:
        img = loadImage("img/enemy-eyes-normal-01.svg");
        break;

      case Game.EnemyTypes.SPLITTER:
        print("splitter!")
        img = loadImage("img/enemy-eyes-splitter-01.svg");
        break;

      case Game.EnemyTypes.SPLITTED:
        img = loadImage("img/enemy-eyes-splitted-01.svg");
        break;

      case Game.EnemyTypes.SHOOTER:
        img = loadImage("img/enemy-eyes-deadpan-01.svg");
        break;

      // case Game.EnemyTypes.EXPLODER:
      //   break;

      case Game.EnemyTypes.BOUNCER:
        img = loadImage("img/enemy-eyes-rabbitball-01.svg");
        break;

      default:
        // 
        break;
    }
  return img;
  }
  getEnemyColor(div = 1.0, a = 255){
    let col = [0,0,0, 0];
    let alpha = a;

    switch (this.type) {
      case Game.EnemyTypes.NORMAL:
        col = [200 / div, 200 / div, 200 / div, alpha];
        break;

      case Game.EnemyTypes.SPLITTER:
        col = [0 / div, 255 / div, 0 / div, alpha];
        break;

      case Game.EnemyTypes.SPLITTED:
        col = [255 / 4 / div, 255 / 4 / div, 255 / 4 / div, alpha];
        break;

      case Game.EnemyTypes.SHOOTER:
        col = [255 / div, 0 / div, 0 / div, alpha];
        break;

      case Game.EnemyTypes.EXPLODER:
        col = [
          255 * (this.#initialHealth / this.health) / div,
          255 * (this.#initialHealth / this.health) / div,
          0 / div, alpha];
        break;

      case Game.EnemyTypes.BOUNCER:
        col = [0 / div, 0 / div, 255 / div, alpha];
        break;

      case Game.EnemyTypes.REFLECTOR:
        col = [100 / div, 255 / div, 100 / div, alpha];
        break;

      case Game.EnemyTypes.SPRINTER:
        col = [255 / div, 255 / div, 255 / div, alpha];
        break;
    }
    return col;
  }
  toString(){
    return `${round(this.x)}, ${round(this.y)}`
  }
}
