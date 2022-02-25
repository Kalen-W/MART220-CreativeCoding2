// Kalen Weinheimer
// 02-24-2022

// This project is based of the following tutorial: youtu.be/5nSFArCgCXA
// This tutorial's code can also be found on GitHub: github.com/satansdeer/raycaster

// Additional features, such as wall texture rendering, figured out with the assistance of the additional following tutorials:
// dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/
// permadi.com/1996/05/ray-casting-tutorial-table-of-contents/

// TODO:
// ================
// Object and enemy texture rendering
// Sky and floor texture rendering
// Remake pause menu using HTML
// Improve movement controls
// Improve collision detection (so the player can 'slide' against a wall)
// Distance based texture altering (making textures darker if further away) - ?
// Account for player size in collision detection - ?
// Touchscreen control options
// Gamepad API (developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) - ?
// Fix continued movement after unpause - caused by moving when paused


//--------------------------------------------------------------------------------------------------------------------------------|Options Functions
function toggleMinimap() {
  options.minimap = !options.minimap;
}

// toggleFullscreen code is from: w3schools.com/howto/howto_js_fullscreen.asp
function toggleFullscreen() {
  var elem = document.documentElement;
  options.fullscreen = !options.fullscreen;

  if (options.fullscreen) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Overlay Elements
function renderOverlayElements() {
  var fontSize = screenW * .022; // 36
  overlayContext.font = fontSize + "px VT323, Monospace";
  overlayContext.fillStyle = colors.overlayTextFill;
  overlayContext.lineWidth = 2;
  overlayContext.strokeStyle = colors.overlayTextStroke;
  renderText();
  //renderTimer();
  renderCompass(player.angle, getAngle(player.x,player.y, 0,0));
}

function renderText() {
  overlayContext.textAlign = "start";
  overlayContext.textBaseline = "top";
  overlayContext.strokeText("Raycasting Prototype", 8, 2);
  overlayContext.fillText("Raycasting Prototype", 8, 2);

  overlayContext.textAlign = "end";
  overlayContext.textBaseline = "bottom";
  overlayContext.strokeText("Kalen Weinheimer", screenW-16, screenH-10);
  overlayContext.fillText("Kalen Weinheimer", screenW-16, screenH-10);
}

function renderPauseMenu() {
  overlayContext.fillStyle = colors.pauseMenuBg;
  overlayContext.fillRect(screenW*.36,screenH*.18, screenW*.28,screenH*.56);

  overlayContext.textAlign = "center";
  overlayContext.textBaseline = "middle";
  overlayContext.fillStyle = colors.overlayTextFill;
  overlayContext.strokeText("Paused", screenW*.5, screenH*.224);
  overlayContext.fillText("Paused", screenW*.5, screenH*.224);
  overlayContext.strokeText("Press 'Tab' To Resume", screenW*.5, screenH*.28);
  overlayContext.fillText("Press 'Tab' To Resume", screenW*.5, screenH*.28);
}

function renderTimer() {
  timer.update();
  timer.display();

  if (timer.finished()) {
    //console.log("timer finished");
    mapChangeFreq = 0;
    currentMap = skullMap;
  }
}

class timerClass {
  constructor(initializeTime, duration) {
    this.init = initializeTime;
    this.duration = duration;
    this.current = this.duration-((totalTicks*tick)-this.init) > 0
      ? this.duration-((totalTicks*tick)-this.init)
      : 0;
    this.hours = Math.floor(this.current / 3600000);
    this.minutes = Math.floor((this.current % 3600000) / 60000);
    this.seconds = Math.floor(((this.current % 3600000) % 60000) / 1000);
  }

  update() {
    this.current = this.duration-((totalTicks*tick)-this.init) > 0
      ? this.duration-((totalTicks*tick)-this.init)
      : 0;
    this.hours = Math.floor(this.current / 3600000);
    this.minutes = Math.floor((this.current % 3600000) / 60000);
    this.seconds = Math.floor(((this.current % 3600000) % 60000) / 1000);
  }

  finished() {
    return this.duration-((totalTicks*tick)-this.init)<=0 ? true : false;
  }

  display() {
    var timerHoursDisplay = this.hours<10 ? "0" + this.hours : this.hours;
    var timerMinutesDisplay = this.minutes<10 ? "0" + this.minutes : this.minutes;
    var timerSecondsDisplay = this.seconds<10 ? "0" + this.seconds : this.seconds;
    overlayContext.textAlign = "end";
    overlayContext.textBaseline = "top";
    overlayContext.strokeText("Timer: "+timerHoursDisplay+":"+timerMinutesDisplay+":"+timerSecondsDisplay, screenW-16, 16);
    overlayContext.fillText("Timer: "+timerHoursDisplay+":"+timerMinutesDisplay+":"+timerSecondsDisplay, screenW-16, 16);
  }
}

//const timer = new timerClass(totalTicks*tick, 1000*16);

/*function renderCompass(angle, angle2) {
  context.font = "36px VT323, Monospace";
  context.fillStyle = "#fff";
  var compassDirection;

  if (angle<roundRadian(0.125*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "- - < < < < - -";
  } else if (angle<roundRadian(0.375*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.125*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "< < < < - - - -";
  } else if (angle<roundRadian(0.625*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.375*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "< < - - - - > >";
  } else if (angle<roundRadian(0.875*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.625*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "- - - - > > > >";
  } else if (angle<roundRadian(1.125*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.875*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "- - > > > > - -";
  } else if (angle<roundRadian(1.375*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.125*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "> > > > - - - [";
  } else if (angle<roundRadian(1.46875*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.375*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "> > - - - [ ] -";
  } else if (angle<roundRadian(1.53125*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.46875*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "> > - [ ] - < <";
  } else if (angle<roundRadian(1.625*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.53125*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "- [ ] - - - < <";
  } else if (angle<roundRadian(1.875*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.625*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "] - - - < < < <";
  } else if (angle<roundRadian(2*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.875*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "- - < < < < - -";
  } else {
    compassDirection = "-Error--";
    console.error("renderCompass statement defaulted | angle = " + angle);
  }
  //console.log(angle + " - " + angle2);
  context.fillText(compassDirection, canvas.width*.5-56, 28);
}*/

function renderCompass(angle, angle2) {
  var compassDirection;
  if (angle<0.125*Math.PI || angle>=1.875*Math.PI) {
    compassDirection = "|----[E]----|";
  } else if (angle<0.375*Math.PI) {
    compassDirection = "E]----|----[S";
  } else if (angle<0.625*Math.PI) {
    compassDirection = "|----[S]----|";
  } else if (angle<0.875*Math.PI) {
    compassDirection = "S]----|----[W";
  } else if (angle<1.125*Math.PI) {
    compassDirection = "|----[W]----|";
  } else if (angle<1.375*Math.PI) {
    compassDirection = "--[W]----|---";
  } else if (angle<1.46875*Math.PI) {
    compassDirection = "---|----[N]--";
  } else if (angle<1.53125*Math.PI) {
    compassDirection = "|----[N]----|";
  } else if (angle<1.6875*Math.PI) {
    compassDirection = "--[N]----|---";
  } else if (angle<1.875*Math.PI) {
    compassDirection = "---|----[E]--";
  } else {
    compassDirection = "Error";
    console.error("renderCompass statement defaulted - angle = " + angle);
  }
  //console.log(angle + " - " + angle2);
  overlayContext.textAlign = "center";
  overlayContext.textBaseline = "top";
  overlayContext.strokeText(compassDirection, screenW*.5, 4);
  overlayContext.fillText(compassDirection, screenW*.5, 4);
}


//--------------------------------------------------------------------------------------------------------------------------------|Map Change Test
var mapChangeFreq = 12; // in number of ticks
var mapChangeVal = 0;
function mapChangeTest() {
  if (totalTicks % mapChangeFreq == 0) {
    if (mapChangeVal < 7) {
      mapChangeVal++;
    } else {
      mapChangeVal = 0;
    }
    currentMap = testMapArray[mapChangeVal];
  }
}

//--------------------------------------------------------------------------------------------------------------------------------|Animated Walls Test
var aniWallArray = [
  [0,128, 128,64, 0,128, 128,64],
  [0,192, 128,64, 0,128, 128,64]
];

function animatedWalls() {
  if (texturesLoaded && totalTicks % Math.floor(tick/2) == 0) {
    aniWallArray.push(aniWallArray[0]);
    aniWallArray.shift();
    //console.log(aniWallArray[0]);

    wallsContext.drawImage(wallsImg,
      aniWallArray[0][0],aniWallArray[0][1],
      aniWallArray[0][2],aniWallArray[0][3],
      aniWallArray[0][4],aniWallArray[0][5],
      aniWallArray[0][6],aniWallArray[0][7]
    );
  }
}
