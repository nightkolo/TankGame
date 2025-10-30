class Sprinker{ // TankBuddy
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

    this.spawned(); 
  }
  spawned(){
    this.#start = millis();

    setTimeout(() => {
      print("peace out")
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
    square(this.x, this.y, this.size);

    fill(255);
    stroke(0);
    textSize(25.0);
    textAlign(CENTER);

    this.timeLeft = Game.tankBuddyLifetime - ((millis() - this.start) / 1000.0)

    text(`${this.getTimeLeft().toFixed(1)}`, this.x, this.y + 8.0);
  }
}
