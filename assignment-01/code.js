//--------------------------------------------------------------------------------------------------------------------------------|Variables
var mid = [screen.availWidth/2, screen.availHeight/2];
var counter = 0;
//var countAmount = .5;

//var sqS = 33+(1/3);
var sqR = 256.666; // ~ 7.7*sqS
var sqR2 = 200; // 6*sqS
var sq1Coords00 = [mid[0]-sqR,mid[1]-sqR, mid[0]+sqR,mid[1]-sqR, mid[0]+sqR,mid[1]+sqR, mid[0]-sqR,mid[1]+sqR];
var sq1Coords45 = [mid[0],mid[1]-274.666, mid[0]+318.666,mid[1]-226, mid[0]+318.666,mid[1]+226, mid[0],mid[1]+274.666];
var sq1Coords90 = [mid[0]+sqR,mid[1]-sqR, mid[0]+sqR2,mid[1]-sqR2, mid[0]+sqR2,mid[1]+sqR2, mid[0]+sqR,mid[1]+sqR];
var sq1Coords135 = [mid[0]+318.666,mid[1]-226, mid[0],mid[1]-192, mid[0],mid[1]+192, mid[0]+318.666,mid[1]+226];

var sq1Coords180 = [mid[0]+sqR2,mid[1]-sqR2, mid[0]-sqR2,mid[1]-sqR2, mid[0]-sqR2,mid[1]+sqR2, mid[0]+sqR2,mid[1]+sqR2];

var sq1Coords225 = [mid[0],mid[1]-192, mid[0]-318.666,mid[1]-226, mid[0]-318.666,mid[1]+226, mid[0],mid[1]+192];
var sq1Coords270 = [mid[0]-sqR2,mid[1]-sqR2, mid[0]-sqR,mid[1]-sqR, mid[0]-sqR,mid[1]+sqR, mid[0]-sqR2,mid[1]+sqR2];
var sq1Coords315 = [mid[0]-318.666,mid[1]-226, mid[0],mid[1]-274.666, mid[0],mid[1]+274.666, mid[0]-318.666,mid[1]+226];
//var sqCoords = [mid[0],mid[1], mid[0],mid[1], mid[0],mid[1], mid[0],mid[1]];

var sq1Coords = [mid[0]-sqR,mid[1]-sqR, mid[0]+sqR,mid[1]-sqR, mid[0]+sqR,mid[1]+sqR, mid[0]-sqR,mid[1]+sqR];
var sq2Coords = [mid[0]+sqR,mid[1]-sqR, mid[0]+sqR2,mid[1]-sqR2, mid[0]+sqR2,mid[1]+sqR2, mid[0]+sqR,mid[1]+sqR];
var sq3Coords = [mid[0]+sqR2,mid[1]-sqR2, mid[0]-sqR2,mid[1]-sqR2, mid[0]-sqR2,mid[1]+sqR2, mid[0]+sqR2,mid[1]+sqR2];
var sq4Coords = [mid[0]-sqR2,mid[1]-sqR2, mid[0]-sqR,mid[1]-sqR, mid[0]-sqR,mid[1]+sqR, mid[0]-sqR2,mid[1]+sqR2];

var direction = 1;
var sq1Order = [sq1Coords00,sq1Coords45, sq1Coords90,sq1Coords135, sq1Coords180,sq1Coords225, sq1Coords270,sq1Coords315];
var sq2Order = [sq1Coords90,sq1Coords135, sq1Coords180,sq1Coords225, sq1Coords270,sq1Coords315, sq1Coords00,sq1Coords45];
var sq3Order = [sq1Coords180,sq1Coords225, sq1Coords270,sq1Coords315, sq1Coords00,sq1Coords45, sq1Coords90,sq1Coords135];
var sq4Order = [sq1Coords270,sq1Coords315, sq1Coords00,sq1Coords45, sq1Coords90,sq1Coords135, sq1Coords180,sq1Coords225];
var sq1Dist = [];
var sq2Dist = [];
var sq3Dist = [];
var sq4Dist = [];


function findDist(coords1, coords2) {
  if (coords1.length != coords2.length) {
    console.log("findDist - unequal array length");
    return false;
  }
  var tempDist = [];
  for (var i=0; i<coords1.length; i++) {
    tempDist[i] = -1*(coords1[i]-coords2[i]);
  }
  return tempDist;
}


function updateOrder(orderIn) {
  for (var i=0; i<orderIn.length; i++) {
    orderIn[i].push(orderIn[i][0]);
    orderIn[i].shift();
  }
}

function updateCoords() {
  counter += 1;
  if (counter>=120) {
    updateOrder([sq1Order, sq2Order, sq3Order, sq4Order]);
    counter = 0;
    sq1Dist = findDist(sq1Order[0],sq1Order[1]);
    sq2Dist = findDist(sq2Order[0],sq2Order[1]);
    sq3Dist = findDist(sq3Order[0],sq3Order[1]);
    sq4Dist = findDist(sq4Order[0],sq4Order[1]);
  }
  for (var i=0; i<sq1Coords.length; i++) {
    // sq1Coords[i] += direction*(findDist(sq1Order[0],sq1Order[1])[i]/120);
    // sq2Coords[i] += direction*(findDist(sq2Order[0],sq2Order[1])[i]/120);
    // sq3Coords[i] += direction*(findDist(sq3Order[0],sq3Order[1])[i]/120);
    // sq4Coords[i] += direction*(findDist(sq4Order[0],sq4Order[1])[i]/120);
    sq1Coords[i] += direction*(sq1Dist[i]/120);
    sq2Coords[i] += direction*(sq2Dist[i]/120);
    sq3Coords[i] += direction*(sq3Dist[i]/120);
    sq4Coords[i] += direction*(sq4Dist[i]/120);
  }
}

function drawSq(points) {
  triangle(points[0],points[1], points[2],points[3], points[4],points[5]);
  triangle(points[0],points[1], points[6],points[7], points[4],points[5]);
}

sq1Dist = findDist(sq1Order[0],sq1Order[1]);
sq2Dist = findDist(sq2Order[0],sq2Order[1]);
sq3Dist = findDist(sq3Order[0],sq3Order[1]);
sq4Dist = findDist(sq4Order[0],sq4Order[1]);
//findDist(sq1Order[0],sq1Order[1]);
//--------------------------------------------------------------------------------------------------------------------------------|Draw
function draw() {
  background(98);
  // counter += countAmount;
  // if (counter>=200 || counter<=0) {
  //   countAmount *= -1;
  // }

  updateCoords();

  strokeWeight(2);
  //stroke(48,88,98);
  noFill();

  stroke(255,0,0);
  drawSq(sq1Coords);
  stroke(128,128,0);
  drawSq(sq2Coords);
  stroke(0,128,128);
  drawSq(sq3Coords);
  stroke(0,0,255);
  drawSq(sq4Coords);

}


//--------------------------------------------------------------------------------------------------------------------------------|Setup & Window Resize
function setup() {
  windowResized();
}

function windowResized() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(windowWidth/2-width/2, windowHeight/2-height/2, 'absolute');
  canvas.style("display", "block");
  canvas.style("z-index", "-1");
  mid = [windowWidth/2, windowHeight/2];
}
