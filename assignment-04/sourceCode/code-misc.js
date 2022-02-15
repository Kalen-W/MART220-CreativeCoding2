// Kalen Weinheimer
// 02-14-2022

// All code here is based of the following tutorial: https://youtu.be/5nSFArCgCXA
// This tutorial's code can also be found on GitHub: https://github.com/satansdeer/raycaster

// TODO:
// ================
// Strafing controls
// Sprite based texture and object rendering
// Distance based texture altering (making textures darker if further away)
// Account for size in collision detection - ?
// Touchscreen control options
// Fix continued movement after unpause - caused by moving when paused


//--------------------------------------------------------------------------------------------------------------------------------|Overlay Elements
function renderOverlayElements() {
  overlayContext.font = "36px VT323, Monospace";
  overlayContext.fillStyle = "#222";
  renderText();
  //renderTimer();
  //renderCompass(player.angle);
  renderCompass(player.angle, getAngle(player.x,player.y, 0,0));
  //console.log(player.angle);
}

function renderText() {
  overlayContext.fillText("Raycasting Prototype", 8, 28);
  overlayContext.fillText("Kalen Weinheimer", screenW-256, screenH-24);
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
    overlayContext.fillText("Timer: "+timerHoursDisplay+":"+timerMinutesDisplay+":"+timerSecondsDisplay, screenW-228, 38);
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
  overlayContext.fillText(compassDirection, screenW*.5-104, 28);
}


function renderPauseMenu() {
  overlayContext.fillStyle = "#282c2f98";
  overlayContext.fillRect(screenW*.36,screenH*.18, screenW*.28,screenH*.56);

  overlayContext.fillStyle = "#222";
  overlayContext.fillText("Paused", screenW*.5-38, screenH*.224);
  overlayContext.fillText("Press 'Tab' To Resume", screenW*.5-142, screenH*.28);
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
