function setup() {
  createCanvas(900,750);
}


function draw() {
  background(220);

  let t = millis() / 800.0;

  let x = width/2;
  let y = height/2;
  let size = 200.0 + (25.0 * sin(t)); // Actual size to be computed for logic and collision
  let dpSize = size; // Size to be visualized and animated (displaySize)
  let sizeX = size; // Size to be visualized and animated
  let sizeY = size; // Size to be visualized and animated

  


  // // Reflector
  // circle(x + (size/3), y + (size/4), size/2);
  // circle(x - (size/3), y + (size/4), size/2);
  // ellipse(x, y, sizeX, sizeY);

  // Shooter
  // rectMode(CENTER);
  // rect(x + size/3.4, y, size/2, size/3);
  // rect(x - size/3.4, y, size/2, size/3);
  // rect(x, y + size/3.4, size/3, size/2);
  // rect(x, y  - size/3.4, size/3, size/2);
  // ellipse(x, y, sizeX, sizeY);

  // // Bouncer
  // ellipse(x + (size/3.5), y - (size/5), size/2, size);
  // ellipse(x - (size/3.5), y - (size/5), size/2, size);
  // ellipse(x, y, sizeX, sizeY);

  // // Reflector enemy
  // let distance = size/2.6;

  // let animX1 = sin(t) * distance;
  // let animY1 = cos(t) * distance;
  
  // let animX2 = sin(t + (PI / 2)) * distance;
  // let animY2 = cos(t + (PI / 2)) * distance;
  
  // let animX3 = sin(t + PI) * distance;
  // let animY3 = cos(t + PI) * distance;

  // let animX4 = sin(t + ((PI * 3) / 2)) * distance;
  // let animY4 = cos(t + ((PI * 3) / 2)) * distance;
  
  // circle(x + animX1, y + animY1, size/2.0);
  // circle(x + animX2, y + animY2, size/2.0);
  // circle(x + animX3, y + animY3, size/2.0);
  // circle(x + animX4, y + animY4, size/2.0);
  // ellipse(x, y, sizeX, sizeY);

  // Shooter
  rectMode(CENTER);
  rect(x + size/2.8, y, size/2.4, size/3);
  rect(x - size/2.8, y, size/2.4, size/3);
  rect(x, y + size/2.8, size/3, size/2.4);
  rect(x, y  - size/2.8, size/3, size/2.4);
  ellipse(x, y, sizeX, sizeY);


}
