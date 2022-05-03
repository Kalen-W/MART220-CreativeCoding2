//--------------------------------------------------------------------------------------------------------------------------------|Variables
const totalFrames = 25;
var mainColor = 255;

var gradientStartColor = [0, 255, 127];
var gradientEndColor = [127, 0, 255];

var invertHeight = 0;
var invertStep;

var circles = [];



//--------------------------------------------------------------------------------------------------------------------------------|Functions
function writeColor(image, x,y, r,g,b,a) {
  let i = (x + y * image.width) * 4;
  // Tried getting it to blend colors, but didn't seem to work for some reason.
  /*if (a < 255) {
    var aFactor = a / 255;
    image.pixels[i] = (r*aFactor + image.pixels[i]) / 2;
    image.pixels[i+1] = (g*aFactor + image.pixels[i+1]) / 2;
    image.pixels[i+2] = (b*aFactor + image.pixels[i+2]) / 2;
    image.pixels[i+3] = 255;
  } else {
    image.pixels[i] = r;
    image.pixels[i+1] = g;
    image.pixels[i+2] = b;
    image.pixels[i+3] = a;
  }*/

  image.pixels[i] = r;
  image.pixels[i+1] = g;
  image.pixels[i+2] = b;
  image.pixels[i+3] = a;
}


function invertColor(image, x,y) {
  let i = (x + y * image.width) * 4;
  image.pixels[i] = 255 - image.pixels[i];
  image.pixels[i+1] = 255 - image.pixels[i+1];
  image.pixels[i+2] = 255 - image.pixels[i+2];
}


function drawGradient(startColor, endColor) {
  var rStep = (endColor[0] - startColor[0]) / img.height;
  var gStep = (endColor[1] - startColor[1]) / img.height;
  var bStep = (endColor[2] - startColor[2]) / img.height;

  var rc = startColor[0];
  var gc = startColor[1];
  var bc = startColor[2];
  var ac = 255;

  for (y=0; y<img.height; y++) {
    for (x=0; x<img.width; x++) {
      writeColor(img, x,y, floor(rc),floor(gc),floor(bc),ac);
    }
    rc += rStep;
    gc += gStep;
    bc += bStep;
  }
}



//--------------------------------------------------------------------------------------------------------------------------------|Setup Function
function setup() {
  img = createImage(640, 480);
  img.loadPixels();
  createCanvas(640, 480);
  background(0);
  frameRate(25);
  noStroke();
  rectMode(CENTER);

  invertStep = img.height / totalFrames;

  drawGradient(gradientStartColor, gradientEndColor);
  img.updatePixels();
  image(img, 0,0);
}



//--------------------------------------------------------------------------------------------------------------------------------|Draw Function
function draw() {
  drawGradient(gradientStartColor, gradientEndColor);

  for(y=0; y<invertHeight; y++) {
    for (x=0; x<img.width; x++) {
      invertColor(img, x,y);
    }
  }
  invertHeight += invertStep;

  img.updatePixels();
  image(img, 0,0);


  circles.push([random(img.width),random(img.height), random(124)+4, random(mainColor),random(mainColor),random(mainColor),random(124)+4]);

  for (var i=0; i<circles.length; i++) {
    var cir = circles[i];
    fill(cir[3], cir[4], cir[5], cir[6]);
    circle(cir[0], cir[1], cir[2]);
  }

  if (frameCount % 2 == 0) { mainColor = 255 - mainColor; }


  saveFrames("myMovie", "png", 1, totalFrames);

  if (frameCount > totalFrames) { noLoop(); }
}
