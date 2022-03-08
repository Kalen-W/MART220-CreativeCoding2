//--------------------------------------------------------------------------------------------------------------------------------|Overlay Elements
function renderOverlayElements() {
  renderHeldItem(overlayContext, player.heldItem);
  renderTempUiElements(overlayContext);

  overlayContext.font = options.fontSize + "px VT323, Monospace";
  overlayContext.fillStyle = colors.overlayTextFill;
  overlayContext.lineWidth = 2;
  overlayContext.strokeStyle = colors.overlayTextStroke;
  renderText();
  //renderTimer();
  renderCompass(player.angle, getAngle(player.x,player.y, 0,0));
  renderFps();
}

function renderFps() {
  overlayContext.font = options.fontSize*.7 + "px VT323, Monospace";
  overlayContext.textAlign = "start";
  overlayContext.textBaseline = "top";
  overlayContext.strokeText(fps.toFixed(1), 6, 2);
  overlayContext.fillText(fps.toFixed(1), 6, 2);
}

function renderText() {
  overlayContext.textAlign = "start";
  overlayContext.textBaseline = "top";
  overlayContext.strokeText("Raycasting Prototype", 74, 2);
  overlayContext.fillText("Raycasting Prototype", 74, 2);

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
  overlayContext.strokeText("Paused", center.x, screenH*.224);
  overlayContext.fillText("Paused", center.x, screenH*.224);
  overlayContext.strokeText("Press 'Tab' To Resume", center.x, screenH*.28);
  overlayContext.fillText("Press 'Tab' To Resume", center.x, screenH*.28);
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

// TODO: Rework timerClass to be time based, not tick based - ?
class TimerClass {
  constructor(initializeTime, duration) {
    this.init = initializeTime;
    this.duration = duration;
    this.current = this.duration-((totalLogicTicks*logicTick)-this.init) > 0
      ? this.duration-((totalLogicTicks*logicTick)-this.init)
      : 0;
    this.hours = Math.floor(this.current / 3600000);
    this.minutes = Math.floor((this.current % 3600000) / 60000);
    this.seconds = Math.floor(((this.current % 3600000) % 60000) / 1000);
  }

  update() {
    this.current = this.duration-((totalLogicTicks*logicTick)-this.init) > 0
      ? this.duration-((totalLogicTicks*logicTick)-this.init)
      : 0;
    this.hours = Math.floor(this.current / 3600000);
    this.minutes = Math.floor((this.current % 3600000) / 60000);
    this.seconds = Math.floor(((this.current % 3600000) % 60000) / 1000);
  }

  finished() {
    return this.duration-((totalLogicTicks*logicTick)-this.init)<=0 ? true : false;
  }

  display() {
    var timerHoursDisplay = this.hours<10 ? "0" + this.hours : this.hours;
    var timerMinutesDisplay = this.minutes<10 ? "0" + this.minutes : this.minutes;
    var timerSecondsDisplay = this.seconds<10 ? "0" + this.seconds : this.seconds;
    overlayContext.textAlign = "end";
    overlayContext.textBaseline = "top";
    overlayContext.strokeText("Timer: "+timerHoursDisplay+":"+timerMinutesDisplay+":"+timerSecondsDisplay, screenW-16, 12);
    overlayContext.fillText("Timer: "+timerHoursDisplay+":"+timerMinutesDisplay+":"+timerSecondsDisplay, screenW-16, 12);
  }
}

//const timer = new TimerClass(totalLogicTicks*logicTick, 1000*16);

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

const compDir = [
  0.125*Math.PI, 1.875*Math.PI,
  0.375*Math.PI,
  0.625*Math.PI,
  0.875*Math.PI,
  1.125*Math.PI,
  1.375*Math.PI,
  1.46875*Math.PI,
  1.53125*Math.PI,
  1.6875*Math.PI,
  1.875*Math.PI
];
function renderCompass(angle, angle2) {
  var compassDirection;
  if (angle<compDir[0] || angle>=compDir[1]) {
    compassDirection = "|----[E]----|";
  } else if (angle<compDir[2]) {
    compassDirection = "E]----|----[S";
  } else if (angle<compDir[3]) {
    compassDirection = "|----[S]----|";
  } else if (angle<compDir[4]) {
    compassDirection = "S]----|----[W";
  } else if (angle<compDir[5]) {
    compassDirection = "|----[W]----|";
  } else if (angle<compDir[6]) {
    compassDirection = "--[W]----|---";
  } else if (angle<compDir[7]) {
    compassDirection = "---|----[N]--";
  } else if (angle<compDir[8]) {
    compassDirection = "|----[N]----|";
  } else if (angle<compDir[9]) {
    compassDirection = "--[N]----|---";
  } else if (angle<compDir[10]) {
    compassDirection = "---|----[E]--";
  } else {
    compassDirection = "Error";
    console.error("renderCompass statement defaulted - angle = " + angle);
  }
  //console.log(angle + " - " + angle2);
  overlayContext.textAlign = "center";
  overlayContext.textBaseline = "top";
  overlayContext.strokeText(compassDirection, center.x, 6);
  overlayContext.fillText(compassDirection, center.x, 6);
}

function renderCrosshair() {
  overlayContext.textAlign = "center";
  overlayContext.textBaseline = "middle";
  overlayContext.fillStyle = colors.crosshair;
  //overlayContext.fillText("+", center.x, center.y);
  overlayContext.fillRect(center.x-options.crosshairR, center.y-options.crosshairR, options.crosshairD, options.crosshairD);
}


//--------------------------------------------------------------------------------------------------------------------------------|New Pause Menu
const menu_pause = {
  t1: 3,
  renderBg: function() {
    overlayContext.fillStyle = colors.pauseMenuBg;
    overlayContext.fillRect(screenW*.36,screenH*.18, screenW*.28,screenH*.56);
  },
  renderText: function() {
    overlayContext.textAlign = "center";
    overlayContext.textBaseline = "middle";
    overlayContext.fillStyle = colors.overlayTextFill;
    overlayContext.strokeText("Paused", center.x, screenH*.224);
    overlayContext.fillText("Paused", center.x, screenH*.224);
    overlayContext.strokeText("Press 'Tab' To Resume", center.x, screenH*.28);
    overlayContext.fillText("Press 'Tab' To Resume", center.x, screenH*.28);
  },
};


//--------------------------------------------------------------------------------------------------------------------------------|Popup Text
function popupText(text) {
  overlayContext.fillStyle = colors.overlayTextFill;
  overlayContext.lineWidth = 2;
  overlayContext.strokeStyle = colors.overlayTextStroke;
  overlayContext.textAlign = "center";
  overlayContext.textBaseline = "top";
  overlayContext.fillStyle = colors.overlayTextFill;
  overlayContext.strokeText("Paused", center.x, 128);
  overlayContext.fillText("Paused", center.x, 128);
}


//--------------------------------------------------------------------------------------------------------------------------------|Render Held Item
// var heldItemX = center.x - (textureRez * 0.5);
// var heldItemY = screenH - textureRez;
function renderHeldItem(ctx, itemId) {
  /*
  var heldItem = player.heldItem;
  var img = heldItem.texture.img;
  var heldItemX = center.x - (textureRez * 0.5) * heldItem.scaleFac;
  var heldItemY = screenH - textureRez * heldItem.scaleFac;
  var sx = textureRez * heldItem.state;
  var sy = 0;
  ctx.drawImage(img, sx,sy, textureRez,textureRez, heldItemX,heldItemY, textureRez*heldItem.scaleFac,textureRez*heldItem.scaleFac);
  */

  player.heldItem.render(ctx)
}

//--------------------------------------------------------------------------------------------------------------------------------|Temp UI Elements
function renderTempUiElements(ctx, now) {
  uiElements.forEach((item, i) => {
    ctx.drawImage(item.texture.img, item.x,item.y, item.sx,item.sy);
  });
}

const uiElements = [
  {texture: new AnimatedTexture(manaOrbAni, 125), x: -96, y: screenH-256, sx: 256, sy: 256},
  {texture: new AnimatedTexture(manaOrbAni, 125), x: -96, y: screenH-320, sx: 256, sy: 256},
  {texture: new AnimatedTexture(manaOrbAni, 125), x: -32, y: screenH-256, sx: 256, sy: 256},
];
