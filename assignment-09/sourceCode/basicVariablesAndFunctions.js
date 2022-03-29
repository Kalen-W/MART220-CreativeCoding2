//--------------------------------------------------------------------------------------------------------------------------------|Variable Section
var screenW = window.innerWidth-1;
var screenH = window.innerHeight-4;

var options = {
  minimap: true,
  overlayElements: true,
  crosshair: true,
  crosshairR: 2,
  crosshairD: 0,
  fullscreen: false,
  mapEditorEnabled: false,
  // fov, fontSize, and lineWidth now updated by start button.
  fov: screenW > 1440 ? 70 : 60,        // player fov
  fontSize: Math.floor(screenW * 0.022),
  lineWidth: screenW > 960 ? 2 : 2,     // changes width/number of "strips" drawn
  mobileControls: false,
  touchSensitivity: 0.2,
  horizontalMouseSensitivity: 0.4,
  verticalMouseSensitivity: 0.4,
};
//Object.entries(options).forEach((item, i) => { console.log(item); });

options.crosshairD = options.crosshairR*2;
screenW = Math.floor(screenW / options.lineWidth) * options.lineWidth;
var center = {x: screenW*.5, y: screenH*.5}

var colors = {
  wallDefault: "#282828",
  floorTop: "#323d3a",
  floorBottom: "#4b544d",
  ceilingTop: "#a5cbe3",
  ceilingBottom: "#829ec1",
  wall: "#309db4",
  wallDark: "#406068",
  rays: "#ffa600",
  overlayTextFill: "#1a1a1a",
  overlayTextStroke: "#b8b8b8",
  crosshair: "#f0f0f0e0",
}


//--------------------------------------------------------------------------------------------------------------------------------|Mathmatical Constant Variables
const cellSize = 18;
const fiveCellSize = cellSize * 5;
const playerSize = 8;
const playerCollisionSize = 0.3;
const textureRez = 64;              // standard texture pixel resolution (assumes square textures)
var fov = toRadians(options.fov);   // player fov
var halfFov = fov * 0.5;
// const viewDist = center.x / Math.tan(fov / 2);               // Now initiated by start button.
// const heightOffsetMult = screenH / toRadians(45);            // Now initiated by start button.
// const halfHeightOffsetMult = heightOffsetMult * 0.5;         // Now initiated by start button.

// const numOfRays = Math.floor(screenW / options.lineWidth);   // Now initiated by start button.
// const angleStep = fov / numOfRays;                           // Now initiated by start button.
// const middleRayL = Math.floor(numOfRays / 2);                // Now initiated by start button.
// const middleRayR = Math.ceil(numOfRays / 2);                 // Now initiated by start button.
const twoPi = Math.PI * 2;
const halfPi = Math.PI * 0.5;


//--------------------------------------------------------------------------------------------------------------------------------|Control Variables
var gameInitiated = false;
var pause = true;
var mousePos = {x: 0, y: 0};
var rmbNum = 2;
var lmbNum = 0;
var lmbIsDown = false;
var rmbIsDown = false;

var controlDefaults = {
  move_yNeg: 'w',
  move_xNeg: 'a',
  move_yPos: 's',
  move_xPos: 'd',
  move_sprint: 'Shift',
  move_jump: ' ',
  look_recenter: 'f',
};

var controlKeys = {
  move_yNeg: 'w',
  move_xNeg: 'a',
  move_yPos: 's',
  move_xPos: 'd',
  move_sprint: 'shift',
  move_jump: ' ',
  look_recenter: 'm',
};


//--------------------------------------------------------------------------------------------------------------------------------|Loop Variables
//var fpsArray = [];
var fps = 0;
const logicTick = 40;       // ~25 fps
var lastLogicLoopTime = 0;
var totalLogicTicks = 0;
const renderTick = 40;
var lastRenderLoopTime = 0;
//var totalRenderTicks = 0;

var spriteMap;
var visibleSprites = [];
var oldVisibleSprites = [];
var enemiesInCrosshair = [];

var zBuffer = [];
function clearZBuffer() { // Also initiates zBuffer.
  for (var i=0; i<screenH; i++) {
    //zBuffer[i] = Array.apply(null, Array(numOfRays));
    zBuffer[i] = Array.apply(null, Array(numOfRays)).map(function() { return {distance: null, r: 0, g: 0, b: 0, a:0}; });
  }
}
// clearZBuffer();  // Now initiated by start button.


//--------------------------------------------------------------------------------------------------------------------------------|Canvas Declaration
// Now initiated by start button.
//
// const canvas = document.createElement("canvas");
// canvas.setAttribute("width", screenW);
// canvas.setAttribute("height", screenH);
// canvas.setAttribute("z-index", "-2");
// canvas.style.position = "absolute";
// canvas.style.top = 0;
// canvas.style.left = 0;
// document.body.appendChild(canvas);
// const context = canvas.getContext("2d",  { alpha: false });
//
// const overlayCanvas = document.createElement("canvas");
// overlayCanvas.setAttribute("width", screenW);
// overlayCanvas.setAttribute("height", screenH);
// overlayCanvas.setAttribute("z-index", "2");
// overlayCanvas.style.position = "absolute";
// overlayCanvas.style.top = 0;
// overlayCanvas.style.left = 0;
// document.body.appendChild(overlayCanvas);
// const overlayContext = overlayCanvas.getContext("2d");
//
// canvas.offscreenCanvas = document.createElement("canvas");
// canvas.offscreenCanvas.width = canvas.width / options.lineWidth;
// canvas.offscreenCanvas.height = canvas.height;
// //const offscreenContext = canvas.offscreenCanvas.getContext("2d", { alpha: false });
// const offscreenContext = canvas.offscreenCanvas.getContext("2d");
//
//
// context.webkitImageSmoothingEnabled = false;
// context.mozImageSmoothingEnabled = false;
// context.imageSmoothingEnabled = false;
// overlayContext.webkitImageSmoothingEnabled = false;
// overlayContext.mozImageSmoothingEnabled = false;
// overlayContext.imageSmoothingEnabled = false;
//
// offscreenContext.webkitImageSmoothingEnabled = false;
// offscreenContext.mozImageSmoothingEnabled = false;
// offscreenContext.imageSmoothingEnabled = false;


//--------------------------------------------------------------------------------------------------------------------------------|Math Functions
function fixFishEye(distance, angle, playerAngle) {
  //const diff = angle - playerAngle;
  const diff = playerAngle - angle;
  return distance * Math.cos(diff);
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function roundRadian(num) {
  return ((num % twoPi) + twoPi) % twoPi;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getAngle(x1,y1, x2,y2) {
  const adj = x2 - x1;
  const opp = y2 - y1;
  return adj >= 0
  ? ((Math.atan(opp/adj) % twoPi) + twoPi) % twoPi
  : (((Math.atan(opp/adj) % twoPi) + twoPi) % twoPi) - Math.PI;
}

function toHex(dec) {
  dec = Math.floor(parseFloat(dec));
  if (dec < 10) {
    return "0" + dec;
  } else if (dec < 16 && dec >= 10) {
    return "0" + dec.toString(16);
  } else {
    return dec.toString(16);
  }
}
