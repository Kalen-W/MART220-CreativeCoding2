//--------------------------------------------------------------------------------------------------------------------------------|Variables
var initials = [
  [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0]
];



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


function drawArray(xStart,yStart, color, array, scale=2, invert=false) {
  for (y=0; y<array.length; y++) {
    if (yStart + y >= img.height) { break; }
    if (yStart + y < 0) { continue; }

    for (x=0; x<array[0].length; x++) {
      if (xStart + x >= img.width) { break; }
      if (xStart + x < 0) { continue; }

      if (array[y][x] == 0) { continue; }

      for (yi=y*scale; yi<y*scale+scale; yi++) {
        for (xi=x*scale; xi<x*scale+scale; xi++) {
          if (invert) {
            invertColor(img, xStart+xi,yStart+yi);
          } else {
            writeColor(img, xStart+xi,yStart+yi, color[0],color[1],color[2],color[3]);
          }
        }
      }

    }
  }
}


function drawBorder(topColor, bottomColor, width=4) {
  // Top border
  for(y=0; y<width; y++) {
    for (x=0; x<img.width; x++) {
      writeColor(img, x,y, topColor[0],topColor[1],topColor[2],255);
    }
  }

  // Bottom border
  for(y=img.height-1; y>img.height-1-width; y--) {
    for (x=0; x<img.width; x++) {
      writeColor(img, x,y, bottomColor[0],bottomColor[1],bottomColor[2],255);
    }
  }
}



//--------------------------------------------------------------------------------------------------------------------------------|Setup Function
function setup() {
  img = createImage(800, 600);
  img.loadPixels();
  createCanvas(800, 600);
  background(0);


  var gradientStartColor = [52, 180, 252];
  var gradientEndColor = [246, 228, 74];
  // Alterate Gradient Colors
  // var gradientStartColor = [0, 255, 127];
  // var gradientEndColor = [127, 0, 255];

  drawGradient(gradientStartColor, gradientEndColor);

  drawArray(728,564, [40,40,40,255], initials, 3, false);
  drawArray(726,562, [40,40,40,255], initials, 3, true);

  drawBorder(gradientEndColor, gradientStartColor, 6);

  // Color inverting
  for (var i=0; i<32; i++) {
    let xSize = Math.floor(random(128)) + 8;
    let ySize = Math.floor(random(128)) + 8;
    let xPos = Math.floor(random(img.width-xSize));
    let yPos = Math.floor(random(img.height-ySize));

    for (y=yPos; y<yPos+ySize; y++) {
      if (y >= img.height) { break; }
      if (y < 0) { continue; }

      for (x=xPos; x<xPos+xSize; x++) {
        if (x >= img.width) { break; }
        if (x < 0) { continue; }

        invertColor(img, x,y);
      }
    }
  }

  img.updatePixels();
  image(img, 0,0);
}
