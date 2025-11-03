class Item {
  #openState;

  constructor(x, y, item, player, cooldown = 8.0) {
    this.x = x;
    this.y = y;
    this.itemType = item;
    this.player = player;
    this.enemies = [];
    this.col = [];

    this.hitsToOpen = 15;
    this.size = 50.0;
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
    this.player.gainItem(this.itemType, this.cooldown);

    // print(`Item gained: ${Game.getItemName(this.item)}`);

    if (this.itemType != Game.Items.SPIKE_SPRINKER){
      Game.startItemTimer(this.itemType, this.cooldown);
    }    

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
      case Game.Items.TWO_AXIS_SHOOTING:
        this.col = [255,0,0];
        break;
      case Game.Items.VARIABLE_SHOOTING:
        this.col = [0,255,0];
        break;
      case Game.Items.SPIKE_SPRINKER:
        this.col = [255,0,255];
        break;
      case Game.Items.SLOWNESS:
        this.col = [255,255,255];
        break;
    }

    fill(this.col[0], this.col[1], this.col[2])
    circle(this.x, this.y, this.size);
    stroke(0);
    textSize(20.0);
    textAlign(CENTER);

    fill(255);

    if (!this.opened ){
      text(`${this.hitsToOpen}`, this.x, this.y);
    } else {
      text("! ! !", this.x, this.y);
    }

    if (this.opened && !this.#openState){
      // print("open!");
      setTimeout(() => {
        this.collected = true;
      }, this.cooldown * 1000.0);
      this.#openState = true;
    }
  }
}