//--------------------------------------------------------------------------------------------------------------------------------|Variables
const totalFrames = 20;
var frames = [];



//--------------------------------------------------------------------------------------------------------------------------------|Preload Function
function preload() {
  for (var i=0; i<totalFrames; i++) {
    frames.push(loadImage('assets/myMovie' + i + '.png'));
  }
}



//--------------------------------------------------------------------------------------------------------------------------------|Setup Function
function setup() {
  createCanvas(640, 480);
  background(0);
  frameRate(25);
  noStroke();
  rectMode(CENTER);
}



//--------------------------------------------------------------------------------------------------------------------------------|Draw Function
function draw() {
  image(frames[frameCount-1], 0,0);

  if (frameCount > totalFrames-1) { noLoop(); }
}
