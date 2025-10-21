class Item { // Rock
  constructor(x, y, item, player){
    this.x = x;
    this.y = y;
    this.item = item;
    this.player = player;
    
    this.hitsToOpen = 15;
    this.size = 50.0;
    
    this.moveX = random() > 1/2;
    this.dir = Math.sign(random()-0.5);
    this.spd = 1.125;

    this.opened = false;
    this.collected = false;
  }
  isOpen(){
    return this.hitsToOpen < 1;
  }
  hit(){
    if (this.opened) return; 

    this.hitsToOpen--;

    if (this.hitsToOpen < 1){
      this.opened = true;
    }
  }
  grantItem(){ // 
    if (this.collected) return;

    this.collected = true;
    this.player.getItem(this.item);
  }
  update(){
    if (!this.opened){
      if (this.moveX){
        this.x += this.spd * this.dir;
      } else {
        this.y += this.spd * this.dir;
      }
    } else if (
      TankMath.circleCollision(this.x, this.y, this.size / 2, this.player.x, this.player.y, this.player.size / 2) &&
      !this.collected
    ) {
      this.grantItem();
    }
  }
  show(){
    circle(this.x, this.y, this.size);
  }
}