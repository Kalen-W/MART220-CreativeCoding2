//--------------------------------------------------------------------------------------------------------------------------------|Variable Section
var screenW = Math.floor(window.innerWidth*0.99);
var screenH = Math.floor(window.innerHeight*0.98);
var center = {x: screenW*.5, y: screenH*.5};

const twoPi = Math.PI * 2;


//--------------------------------------------------------------------------------------------------------------------------------|Load Models
let textModel;
let textTexture;
let porigonModel;

function preload() {
  textModel = loadModel('./assets/CreativeCoding2Assignment10Text.obj', true);
  textTexture = loadImage('assets/TextTexture.png');
  porigonModel = loadModel('./assets/Porigon.obj', true);
}


//--------------------------------------------------------------------------------------------------------------------------------|Setup & Window Resize
function setup() {
  windowResized();
}

function windowResized() {
  canvas = createCanvas(Math.floor(windowWidth*.99), Math.floor(windowWidth*.98), WEBGL);
  canvas.position(windowWidth*.005, windowHeight*.01, 'absolute');
  canvas.style("display", "block");
  canvas.style("z-index", "-1");
}


function cubeSpiral(size, amount, x,y,z, tx,ty,tz, r) {
  push();
    translate(x,y,z);
    rotateZ(r);
    rotateY(r);
    rotateX(-r);
    box(size);

    for (var i=0; i<amount; i++) {
      rotateZ(r);
      rotateY(r);
      rotateX(-r);
      translate(tx,ty,tz);
      box(size);
    }
  pop();
}


//--------------------------------------------------------------------------------------------------------------------------------|Draw Function
var rx = -2 * Math.PI;
var rx2 = -2 * Math.PI;
var rx3 = -2 * Math.PI;
var rx4 = -2 * Math.PI;

var rxSpeed = 0.01;


function draw() {
  background(44,46,50);

  rx += rxSpeed;
  if (rx >= twoPi || rx <= -twoPi) { rx *= -1; }


  cubeSpiral(22, 8, 0,-center.y,0, 46,0,0, rx);
  cubeSpiral(22, 8, 0,-center.y,0, -46,0,0, rx);

  cubeSpiral(22, 8, 0,-center.y,0, 0,46,0, rx);
  cubeSpiral(22, 8, 0,-center.y,0, 0,-46,0, rx);

  cubeSpiral(22, 8, 0,-center.y,0, 0,0,46, -rx);
  cubeSpiral(22, 8, 0,-center.y,0, 0,0,-46, -rx);


  push();
    scale(2);
    translate(center.x/2.8, -center.y/1.4, 0);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    normalMaterial();
    texture(textTexture);
    model(textModel);
  pop();
  push();
    scale(1.6);
    translate(-center.x/2.6, -center.y/3.8, 0);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    normalMaterial();
    model(porigonModel);
  pop();
}
