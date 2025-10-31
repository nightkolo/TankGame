function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(220);
  rectMode(CENTER)
  // noCursor();


  // let px = mouseX;
  // let py = mouseY;

  let px = width/2;
  let py = height/2;
  let psize = 250.0;
  
  square(px - (psize/2.5), py, psize/2.0);
  square(px + (psize/2.5), py, psize/2.0);
  square(px, py - (psize/2.5), psize/2.0);
  square(px, py + (psize/2.5), psize/2.0);

  
  square(px, py, psize, psize/20.0);
  
  ellipse(px - (psize/7), py, psize/3, psize/1.75);
  
  strokeWeight(psize/4.0);

  line(px + (psize/6), py - (psize/4), px + (psize/2.5), py + (psize/6));
  line(
    
    px + (psize/2.5),
    py - (psize/5),
    px + (psize/8),
    py + (psize/4)
  );

  
  strokeWeight(8);
  
}
function keyPressed(event) {
  if (event.key === "ArrowUp"|| event.key.toLowerCase() == "w") {
     
  } else if ( event.key === "ArrowDown" || event.key.toLowerCase() == "s") {
     
  } else if ( event.key === "ArrowLeft" || event.key.toLowerCase() == "a") {
     
  } else if ( event.key === "ArrowRight" || event.key.toLowerCase() == "d") {
     
  }
}