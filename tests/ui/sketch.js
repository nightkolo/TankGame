// import { Font } from "../../../../../../.vscode/extensions/samplavigne.p5-vscode-1.2.16/p5types";



// It kinda sucks when you don't have that creative energy :/


let gui;
let f;

function preload(){
  f = loadFont("font/Nunito-Bold.ttf");
}

function setup() {


  createCanvas(400, 400);

  let w = 100;
  let h = 32;
  gui = createGui();
  b = createButton("Start", (width/2) - w/2, 50, w, h);
  b2 = createButton("Start", (width/2) - w/2, 100, w, h);

  b.labelOn = "Bad idea.";
  b.setStyle({
      fillBg: color("#fbbfbfff"),
      font: f,
      rounding: 5,
      textSize: 20
  });

}



function draw() {
  background(220);
  textFont("Nunito");
  textStyle(BOLD);

  textSize(25);
  text("Hello there. y", width/2, height/2);
  
  if(b.isPressed) {
    print(b.label + " is pressed.");
  }

  drawGui();
}
