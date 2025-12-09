class Enemy {
  #lastShotTime = 0.0;
  #initialY;
  #initialHealth;
  #slowState = false;
  #lastHitTime = 0.0;
  #col = [0, 0, 0, 0];

  constructor({ x = 200, y = 200, health = 10, maxSpeed = Game.defaultEnemySpeed, type = Game.EnemyTypes, followPlayer = true
  } = {}) {
    // Position
    this.x = x;
    this.y = y;
    this.#initialY = y / 2.0;
    
    // Size
    this.size = {
      real: this.getSize(),
      dpSize: this.getSize()
    }
    
    // Stats
    this.maxSpeed = maxSpeed;
    this.health = health;
    this.points = round(health / 4.0);
    this.#initialHealth = health;
    
    // Properties
    this.type = type; // Enemy type based on enum
    this.critHitPoint = floor(random(5, 10));
    
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
    
    // Types
    // Rabbitball
    this.rabbitball = {
      accel: 0.0,
      dirX: Math.sign(random() - 0.5)
    }
    
    // Power-up mods
    Game.slowMode = false;
    
    // State
    this.canMove = false;
    this.canHurt = false;
    this.canShoot = false;
    this.isBeingHit = false;
    
    // Animation
    this.bounceAnim = {
      t: 1.0, playing: false, x: 0, y: 0
    }
    this.spawnAnim = {
      t: 1.0, playing: false
    }
    
    // Misc.
    this.followPlayer = followPlayer;
    
    this.spawned();
  }
  spawned() {
    this.animSpawn();

    this.y = (this.type === Game.EnemyTypes.BOUNCER) ? this.#initialY / 2.0 : this.y;

    setTimeout(() => {
      this.canMove = true;
      this.canHurt = true;
      this.canShoot = this.type === Game.EnemyTypes.SHOOTER;
    }, Game.enemySpawnTime * 1000.0);
  }
  move(){
    if (!this.canMove) return;

    if (this.type === Game.EnemyTypes.BOUNCER){
      this.moveRabbitball();    
    } else {
      this.moveTowardPlayer();
    }
  }
  moveRabbitball() {
    if (this.x > width - this.size.real / 2.0 || this.x < this.size.real / 2) {
      this.rabbitball.dirX *= -1;
    }

    let spd = (Game.slowMode) ? this.maxSpeed / 8.0 : this.maxSpeed;
    let fallFactor = (Game.slowMode) ? 0.015 / 8.0 : 0.015;

    if (Game.slowMode){
      this.#slowState = true;
    } else if (this.#slowState) {
      this.y = this.#initialY;
      this.rabbitball.accel = 0.0;
      this.canMove = true;
      this.canHurt = false;

      setTimeout(() => {
        this.canHurt = true;
      }, 1000.0);

      this.#slowState = false;
    }

    this.x += deltaTime * this.rabbitball.dirX * spd * 0.06;
    this.rabbitball.accel += deltaTime * Game.GRAV * 0.06;
    this.y += deltaTime * this.rabbitball.accel * fallFactor  * 0.06;

    if (this.y > height - (this.size.real / 2.0)) {
      // this.bounceSFX.play();
      animScreenShake();

      // TODO issue, make a fixed calculated value
      this.rabbitball.accel -= this.rabbitball.accel * 2.0;
    }
  }
  moveTowardPlayer() {
    if (Game.currentPlayer == null || !this.followPlayer) return;
    
    let dx = Game.currentPlayer.x - this.x;
    let dy = Game.currentPlayer.y - this.y;
    const distance = sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      dx /= distance;
      dy /= distance;
      let spd = (this.type !== Game.EnemyTypes.SPRINTER)
      ? this.maxSpeed * (1.0 - (this.health / (Game.enemyHealthFactor + 10.0)))
      : this.maxSpeed * 2.0;
      
      if (Game.slowMode){ spd /= 4.0; }

      this.x += dx * spd;
      this.y += dy * spd;
    }
  }
  spawnBullets() { // Called by sketch.js
    if (!this.canShoot && this.type != Game.EnemyTypes.SHOOTER) return false;
    
    const shootingSpdFactor = 1.7;
    const factor = (Game.slowMode) ? shootingSpdFactor * 4.0 : shootingSpdFactor;

    if (millis() - this.#lastShotTime > factor * 1000) {
      let aud = this.shootSFXs[floor(random() * this.shootSFXs.length)];
      aud.play()

      this.#lastShotTime = millis();
      return true; // ready to fire
    }
    return false;
  }
  moveAwayItemCollected(x, y){ // Called by Item
    if (this.type == Game.EnemyTypes.BOUNCER) return;
    
    let dx = x - this.x;
    let dy = y - this.y;
    const distance = sqrt(dx * dx + dy * dy);

    if (distance > 0){
      dx /= distance;
      dy /= distance;
      const spd = 80.0;

      this.x -= dx * spd;
      this.y -= dy * spd;
    }
  }
  update() {
    this.size.real = this.getSize();
    this.size.dpSize = this.getSize();
    
    if (this.isBeingHit){
      this.eyeX = this.x;
      this.eyeY = this.y;
    } else if (Game.currentPlayer !== undefined){
      this.eyeX = this.x + ((Game.currentPlayer.x - this.eyeX) / 25.0);
      this.eyeY = this.y + ((Game.currentPlayer.y - this.eyeY) / 25.0);
    }

    if (this.isBeingHit && millis() - this.#lastHitTime > 200) {
      this.isBeingHit = false;
    }

    this.move();
  }
  show() {
    rectMode(CENTER);

    let imgSize = 68.0;
    
    fill(this.#col[0], this.#col[1], this.#col[2], this.#col[3]);

    if (!this.canHurt){
      this.#col = this.getEnemyColor(5.0, 255/4);
      stroke(this.getEnemyColor());
      strokeWeight(10);

    } else {
      strokeWeight(5);

      if (!this.isBeingHit) {
        this.#col = this.getEnemyColor();
        stroke(this.getEnemyColor(4.0));
      }

      switch (this.type) {
        case Game.EnemyTypes.SPLITTER:
          circle(this.x + (this.size.real/3), this.y + (this.size.real/4), this.size.real/2);
          circle(this.x - (this.size.real/3), this.y + (this.size.real/4), this.size.real/2);
          break;

        case Game.EnemyTypes.SPLITTED:
          circle(this.x + (this.size.real/3), this.y, this.size.real/2);
          circle(this.x - (this.size.real/3), this.y, this.size.real/2);
          break;

        case Game.EnemyTypes.SHOOTER:
          imgSize = 92.0;
          rect(this.x + this.size.real/3.4, this.y, this.size.real/2, this.size.real/3);
          rect(this.x - this.size.real/3.4, this.y, this.size.real/2, this.size.real/3);
          rect(this.x, this.y + this.size.real/3.4, this.size.real/3, this.size.real/2);
          rect(this.x, this.y  - this.size.real/3.4, this.size.real/3, this.size.real/2);
          break;

        case Game.EnemyTypes.EXPLODER:
          break;

        case Game.EnemyTypes.BOUNCER:
          // TODO trail for Rabbitball enemy

          ellipse(this.x + (this.size.real/3.5), this.y - (this.size.real/5), this.size.real/2, this.size.real);
          ellipse(this.x - (this.size.real/3.5), this.y - (this.size.real/5), this.size.real/2, this.size.real);
          break;

        case Game.EnemyTypes.REFLECTOR:
          let t = millis() / 800.0;
          let distance = this.size.dpSize/2.6;

          circle(
            this.x + (sin(t) * distance),
            this.y + (cos(t) * distance),
            this.size.real/2.0);
          circle(
            this.x + (sin(t + (PI / 2)) * distance),
            this.y + (cos(t + (PI / 2)) * distance),
            this.size.real/2.0);
          circle(
            this.x + (sin(t + PI) * distance),
            this.y + (cos(t + PI) * distance),
            this.size.real/2.0);
          circle(
            this.x + (sin(t + ((PI * 3) / 2)) * distance),
            this.y + (cos(t + ((PI * 3) / 2)) * distance),
            this.size.real/2.0);
          break;

        default:
          break;
      }
    } 

    // Animation
    if (this.spawnAnim.playing) {
      this.spawnAnim.t += deltaTime * 0.001 * Game.enemySpawnTime;

      circle(this.x, this.y, this.size.dpSize * this.spawnAnim.t);

      if (this.spawnAnim.t >= 1) {
        this.animBounce();
        this.spawnAnim.playing = false;
      }
    } else if (this.bounceAnim.playing) {
      this.bounceAnim.t += deltaTime * 0.00045;
      let eased = Anim.elasticEaseOut(constrain(this.bounceAnim.t, 0, 1));
      let x = lerp(this.bounceAnim.x, this.size.dpSize, eased);
      let y = lerp(this.bounceAnim.y, this.size.dpSize, eased);

      ellipse(this.x, this.y, x, y);

      if (this.bounceAnim.t >= 1) this.bounceAnim.playing = false;
    } else {
      circle(this.x, this.y, this.size.dpSize);
    }

    // TODO mask somehow
    if (!this.spawnAnim.playing && this.imgEyes !== undefined && this.imgHitEyes != undefined){
      if (this.isBeingHit){
        this.imgEyes.resize(imgSize + this.health * 2.0, 0);
        image(this.imgHitEyes, this.eyeX, this.eyeY);

        text(`${this.health}`, this.x, this.y - 20.0);
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

    if (this.isBeingHit){
      text(`${this.health}`, this.x, this.y - 20.0);
    }
  }
  hit(hitX = 0, hitY = 0, hitpoint = 1) {
    this.#lastHitTime = millis(); // record when last hit occurred
    this.isBeingHit = true;

    this.#col[0] *= 0.65;
    this.#col[1] *= 0.65;
    this.#col[2] *= 0.65;

    this.animBounce(hitX !== 0 && hitY == 0);

    this.health -= hitpoint;

    // Critical hit detection
    if (random() < 1 / Game.critHitProb && this.health == this.critHitPoint){
      console.log("Critical Hit!");
      Game.critHitEvent(this.x, this.y);
      animCritHit();
      this.health = 0;
    }

    this.knockback(hitX, hitY);
  }
  knockback(hitX, hitY) {
    if (this.type == Game.EnemyTypes.BOUNCER) return;
    this.x += 6.0 * hitX;
    this.y += 6.0 * hitY;
  }
  hasDied() {
    return this.health < 1;
  }
  animBounce(sideHit = false){
    if (this.bounceAnim.t < 0.5) return;

    this.bounceAnim.x = (sideHit) ? this.size.dpSize - (this.size.dpSize / 2.5) : this.size.dpSize + (this.size.dpSize / 2.5);
    this.bounceAnim.y = (sideHit) ? this.size.dpSize + (this.size.dpSize / 2.5) : this.size.dpSize - (this.size.dpSize / 2.5);
    this.bounceAnim.t = 0.0;
    this.bounceAnim.playing = true;
  }
  animSpawn(){
    this.spawnAnim.t = 0.0;
    this.spawnAnim.playing = true;
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
    const eyeMap = {
      [Game.EnemyTypes.NORMAL]: "img/enemy-eyes-normal-01.svg",
      [Game.EnemyTypes.SPLITTER]: "img/enemy-eyes-splitter-01.svg",
      [Game.EnemyTypes.SPLITTED]: "img/enemy-eyes-splitted-01.svg",
      [Game.EnemyTypes.SHOOTER]: "img/enemy-eyes-deadpan-01.svg",
      [Game.EnemyTypes.BOUNCER]: "img/enemy-eyes-rabbitball-01.svg"
    };
    
    const path = eyeMap[this.type];
    return path ? loadImage(path) : undefined;
  }
  getEnemyColor(div = 1.0, a = 255){
    const colorMap = {
      [Game.EnemyTypes.NORMAL]: [200, 200, 200],
      [Game.EnemyTypes.SPLITTER]: [0, 255, 0],
      [Game.EnemyTypes.SPLITTED]: [64, 64, 64],
      [Game.EnemyTypes.SHOOTER]: [255, 0, 0],
      [Game.EnemyTypes.BOUNCER]: [0, 0, 255],
      [Game.EnemyTypes.REFLECTOR]: [100, 255, 100],
      [Game.EnemyTypes.SPRINTER]: [255, 255, 255]
    };

    const baseColor = colorMap[this.type] || [128, 128, 128];

    if (this.type === Game.EnemyTypes.EXPLODER) { // Special case
      const scale = this.#initialHealth / this.health;
      return [
        (255 * scale) / div,
        (255 * scale) / div,
        0 / div,
        a
      ];
    }

    return [
      baseColor[0] / div,
      baseColor[1] / div,
      baseColor[2] / div,
      a
    ];
  }
  toString(){
    return `${this.type}`;
  }
}
