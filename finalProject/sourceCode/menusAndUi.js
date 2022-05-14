//--------------------------------------------------------------------------------------------------------------------------------|Overlay Elements
function renderOverlayElements() {
  //renderTempUiElements(overlayContext);

  overlayContext.font = options.fontSize + "px VT323, Monospace";
  overlayContext.fillStyle = colors.overlayTextFill;
  overlayContext.lineWidth = 2;
  overlayContext.strokeStyle = colors.overlayTextStroke;
  //renderText();
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




//--------------------------------------------------------------------------------------------------------------------------------|Main Menu
const menu_main = {
  visible: true,
  screenOverlay: document.getElementById('screenOverlay-mainMenu'),
  title: document.getElementById('menu-main-title'),
  buttonContainer: document.getElementById('menu-main-buttonContainer'),
  startBtn: document.getElementById('btn-menu-main-start'),
  graphicsBtn: document.getElementById('btn-menu-main-graphics'),
  optionsBtn: document.getElementById('btn-menu-main-options'),
  controlsBtn: document.getElementById('btn-menu-main-controls'),
  quitBtn: document.getElementById('btn-menu-main-quit'),

  init: function() {
    var obj = this;
    this.startBtn.addEventListener('click', function() {
      screenW = window.innerWidth-1;
      screenH = window.innerHeight-4;
      options.fov = screenW > 1440 ? 70 : 60;
      options.fontSize = Math.floor(screenW * 0.022);
      options.lineWidth = screenW > 960 ? 4 : 2;
      screenW = Math.floor(screenW / options.lineWidth) * options.lineWidth;
      center = {x: screenW*0.5, y: screenH*0.5}

      viewDist = center.x / Math.tan(fov / 2);
      heightOffsetMult = screenH / toRadians(45);
      halfHeightOffsetMult = heightOffsetMult * 0.5;
      numOfRays = Math.floor(screenW / options.lineWidth);
      angleStep = fov / numOfRays;
      middleRayL = Math.floor(numOfRays / 2);
      middleRayR = Math.ceil(numOfRays / 2);

      clearZBuffer();
      heldItemTypes.forEach((item, i) => { item.init(); });

      canvas = document.createElement("canvas");
      canvas.setAttribute("width", screenW);
      canvas.setAttribute("height", screenH);
      canvas.setAttribute("z-index", "-2");
      canvas.style.position = "absolute";
      canvas.style.top = 0;
      canvas.style.left = 0;
      document.body.appendChild(canvas);
      context = canvas.getContext("2d",  { alpha: false });
      overlayCanvas = document.createElement("canvas");
      overlayCanvas.setAttribute("width", screenW);
      overlayCanvas.setAttribute("height", screenH);
      overlayCanvas.setAttribute("z-index", "2");
      overlayCanvas.style.position = "absolute";
      overlayCanvas.style.top = 0;
      overlayCanvas.style.left = 0;
      document.body.appendChild(overlayCanvas);
      overlayContext = overlayCanvas.getContext("2d");
      canvas.offscreenCanvas = document.createElement("canvas");
      canvas.offscreenCanvas.width = canvas.width / options.lineWidth;
      canvas.offscreenCanvas.height = canvas.height;
      offscreenContext = canvas.offscreenCanvas.getContext("2d");

      context.webkitImageSmoothingEnabled = false;
      context.mozImageSmoothingEnabled = false;
      context.imageSmoothingEnabled = false;
      overlayContext.webkitImageSmoothingEnabled = false;
      overlayContext.mozImageSmoothingEnabled = false;
      overlayContext.imageSmoothingEnabled = false;
      offscreenContext.webkitImageSmoothingEnabled = false;
      offscreenContext.mozImageSmoothingEnabled = false;
      offscreenContext.imageSmoothingEnabled = false;

      screenImgData = offscreenContext.createImageData(canvas.width / options.lineWidth, canvas.height);
      screenImgWidth = screenImgData.width;
      screenImgLength = screenImgData.data.length;

      setTimeout(init, 5);
      setTimeout(obj.toggle.bind(obj), 20);
    });

    this.controlsBtn.addEventListener('click', function() {
      menu_controls.toggle(true);
    });
    this.quitBtn.addEventListener('click', function() {
      window.close();
    });
  },


  toggle: function(override) {
    if (typeof override == 'boolean') {
      this.visible = override;
    } else {
      this.visible = !this.visible;
    }

    if (this.visible) {
      this.screenOverlay.style.display = 'block';
    } else {
      this.screenOverlay.style.display = 'none';
    }
  },
};

menu_main.init();




//--------------------------------------------------------------------------------------------------------------------------------|Controls Menu
const menu_controls = {
  visible: false,
  screenOverlay: document.getElementById('screenOverlay-controlsMenu'),
  // mainContainer: document.getElementById('menu-controls'),
  buttonContainer: document.getElementById('menu-controls-buttonContainer'),

  closeBtn: document.getElementById('btn-menu-controls-close'),

  init: function() {
    var obj = this;
    this.closeBtn.addEventListener('click', function() {
      obj.toggle(false);
    });
  },

  toggle: function(override) {
    if (typeof override == 'boolean') {
      this.visible = override;
    } else {
      this.visible = !this.visible;
    }

    if (this.visible) {
      this.screenOverlay.style.display = 'flex';
    } else {
      this.screenOverlay.style.display = 'none';
    }
  },
};

menu_controls.init();




//--------------------------------------------------------------------------------------------------------------------------------|Pause Menu
const menu_pause = {
  visible: false,
  screenOverlay: document.getElementById('screenOverlay-pause'),
  mainContainer: document.getElementById('menu-pause'),
  buttonContainer: document.getElementById('menu-pause-buttonContainer'),
  resumeContainer: document.getElementById('menu-pause-resumeContainer'),
  resetBtn: document.getElementById('btn-menu-pause-reset'),
  optionsBtn: document.getElementById('btn-menu-pause-options'),
  controlsBtn: document.getElementById('btn-menu-pause-controls'),
  resumeBtn: document.getElementById('btn-menu-pause-resume'),

  resetPopup: {
    visible: false,
    container: document.getElementById('popup-container-reset'),
    noBtn: document.getElementById('btn-popup-no-reset'),
    yesBtn: document.getElementById('btn-popup-yes-reset'),
    toggle: function(override) {
      if (typeof override == 'boolean') {
        this.visible = override;
      } else {
        this.visible = !this.visible;
      }

      if (this.visible) {
        this.container.style.display = 'flex';
      } else {
        this.container.style.display = 'none';
      }
    },
  },

  init: function() {
    var obj = this;
    this.resumeBtn.addEventListener('click', function() {
      obj.toggle(false);
      pauseUpdate(false);
    });
    this.resetBtn.addEventListener('click', function() {
      obj.resetPopup.toggle(true);
    });
    this.resetPopup.noBtn.addEventListener('click', function() {
      obj.resetPopup.toggle(false);
    });
    this.resetPopup.yesBtn.addEventListener('click', function() {
      location.reload();
    });

    this.controlsBtn.addEventListener('click', function() {
      menu_controls.toggle(true);
    });
  },

  toggle: function(override) {
    if (typeof override == 'boolean') {
      this.visible = override;
    } else {
      this.visible = !this.visible;
    }

    if (this.visible) {
      // this.mainContainer.style.display = 'block';
      this.screenOverlay.style.display = 'block';
    } else {
      // this.mainContainer.style.display = 'none';
      this.screenOverlay.style.display = 'none';
    }
  },
};

menu_pause.init();




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
