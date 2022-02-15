//--------------------------------------------------------------------------------------------------------------------------------|Variables & Setup
const map = [
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1]
];


const canvas = document.createElement("canvas");
canvas.setAttribute("width", 1000);
canvas.setAttribute("height", 1000);
canvas.setAttribute("z-index", "-2");
canvas.style.position = "absolute";
canvas.style.top = 0;
canvas.style.left = 0;
document.body.appendChild(canvas);
const context = canvas.getContext("2d",  { alpha: false });

const cellSize = canvas.width / map[0].length;
const tick = 30;

class playerClass {
  constructor() {
    this.x = 2;
    this.y = 6;
    this.angle = toRadians(0);
    this.speed = 0;
    this.speedMod = .14;
  }

  loopAngle() {
    this.angle = roundRadian(this.angle);
    /*if (this.angle < 0) {
      this.angle = (2*Math.PI) + this.angle;
    } else if (this.angle > 2*Math.PI) {
      this.angle -= 2*Math.PI;
    }*/
  }
}
const player = new playerClass();


//--------------------------------------------------------------------------------------------------------------------------------|Interval Loop
function renderLoop() {
  clearScreen();
  renderGrid();


  movePlayer();
  player.loopAngle();

  var pointAngle = getAngle(player.x,player.y, 3,3);
  renderLine2(player.x,player.y, 3,3);

  renderLine2(player.x,player.y, 0,player.y);
  renderLine2(player.x,player.y, player.x,0);

  renderAngle(player.x,player.y, roundRadian(0.125*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(0.375*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(0.625*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(0.875*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(1.125*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(1.375*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(1.46875*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(1.53125*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(1.625*Math.PI+pointAngle+.5*Math.PI));
  renderAngle(player.x,player.y, roundRadian(1.875*Math.PI+pointAngle+.5*Math.PI));

  renderPlayer();

  //console.log(getAngle(player.x,player.y, 3,3));
  //renderAngle(player.x,player.y, pointAngle);
  //renderAngle(player.x,player.y, player.angle);
  renderCompass(player.angle, pointAngle);

  const successLine1 = roundRadian(1.46875*Math.PI+pointAngle+.5*Math.PI);
  const successLine2 = roundRadian(1.53125*Math.PI+pointAngle+.5*Math.PI);

  if (player.angle > successLine1 && player.angle < successLine2) {
    //console.log("========SUCCESS========");
  }
}
setInterval(renderLoop, tick);

function clearScreen() {
  context.fillStyle = "#282828";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function roundRadian(num) {
  return ((num % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
}



function renderCompass(angle, angle2) {
  context.font = "36px VT323, Monospace";
  context.fillStyle = "#fff";
  var compassDirection;

  console.log(
    roundRadian(0*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(0.125*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(0.375*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(0.625*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(0.875*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(1.125*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(1.375*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(1.46875*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(1.53125*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(1.625*Math.PI+angle2+.5*Math.PI) + " | " +
    roundRadian(1.875*Math.PI+angle2+.5*Math.PI) + " || " +
    angle
  );


  if (angle<roundRadian(0.125*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "--<<<<--";
  } else if (angle<roundRadian(0.375*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.125*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "<<<<----";
  } else if (angle<roundRadian(0.625*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.375*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "<<---->>";
  } else if (angle<roundRadian(0.875*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.625*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "---->>>>";
  } else if (angle<roundRadian(1.125*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(0.875*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "-->>>>--";
  } else if (angle<roundRadian(1.375*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.125*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = ">>>>---[";
  } else if (angle<roundRadian(1.46875*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.375*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = ">>---[]-";
  } else if (angle<roundRadian(1.53125*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.46875*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = ">>-[]-<<";
  } else if (angle<roundRadian(1.625*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.53125*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "-[]---<<";
  } else if (angle<roundRadian(1.875*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.625*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "]---<<<<";
  } else if (angle<roundRadian(2*Math.PI+angle2+.5*Math.PI) && angle>=roundRadian(1.875*Math.PI+angle2+.5*Math.PI)) {
    compassDirection = "--<<<<--";
  } else {
    compassDirection = "Error";
    console.error("renderCompass statement defaulted | angle = " + angle);
  }
  //console.log(angle + " - " + angle2);
  context.fillText(compassDirection, canvas.width*.5-56, 28);

  const successLine1 = roundRadian(1.46875*Math.PI+angle2+.5*Math.PI);
  const successLine2 = roundRadian(1.53125*Math.PI+angle2+.5*Math.PI);
  if (angle > successLine1 && angle < successLine2) {
    console.log("========SUCCESS========");
  }
}

/*function renderCompass(angle, angle2) {
  context.font = "36px VT323, Monospace";
  context.fillStyle = "#fff";
  var compassDirection;
  if (angle<roundRadian(0.125*Math.PI+angle2)) {
    console.log(roundRadian(0.125*Math.PI+angle2) + " > " + angle + " >= " + roundRadian(1.875*Math.PI+angle2));
    compassDirection = "--<<<<--";
  } else if (angle<roundRadian(0.375*Math.PI+angle2)) {
    compassDirection = "<<<<----";
  } else if (angle<roundRadian(0.625*Math.PI+angle2)) {
    compassDirection = "<<---->>";
  } else if (angle<roundRadian(0.875*Math.PI+angle2)) {
    compassDirection = "---->>>>";
  } else if (angle<roundRadian(1.125*Math.PI+angle2)) {
    compassDirection = "-->>>>--";
  } else if (angle<roundRadian(1.375*Math.PI+angle2)) {
    compassDirection = ">>>>---[";
  } else if (angle<roundRadian(1.46875*Math.PI+angle2)) {
    compassDirection = ">>---[]-";
  } else if (angle<roundRadian(1.53125*Math.PI+angle2)) {
    compassDirection = ">>-[]-<<";
  } else if (angle<roundRadian(1.625*Math.PI+angle2)) {
    compassDirection = "-[]---<<";
  } else if (angle<roundRadian(1.875*Math.PI+angle2)) {
    compassDirection = "]---<<<<";
  } else if (angle>=roundRadian(1.875*Math.PI+angle2)) {
    compassDirection = "--<<<<--";
  } else {
    compassDirection = "Error";
    console.error("renderCompass statement defaulted - angle = " + angle);
  }
  //console.log(angle + " - " + angle2);
  context.fillText(compassDirection, canvas.width*.5-56, 28);

  const successLine1 = roundRadian(1.46875*Math.PI+angle2+.5*Math.PI);
  const successLine2 = roundRadian(1.53125*Math.PI+angle2+.5*Math.PI);
  if (angle > successLine1 && angle < successLine2) {
    console.log("========SUCCESS========");
  }
}*/


//--------------------------------------------------------------------------------------------------------------------------------|RenderFunctions
function renderGrid() {
  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        context.fillStyle = "#999";
        context.fillRect(
          x * cellSize,
          y * cellSize,
          cellSize,
          cellSize
        );
      }
    });
  });
}

function renderPlayer() {
  context.fillStyle = "#367aa1";
  context.fillRect(
    player.x * cellSize - 32 / 2,
    player.y * cellSize - 32 / 2,
    32,
    32
  );

  const rayLength = 1;
  context.strokeStyle = "#4380ac";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(player.x * cellSize, player.y * cellSize);
  context.lineTo(
    (player.x + Math.cos(player.angle) * rayLength) * cellSize,
    (player.y + Math.sin(player.angle) * rayLength) * cellSize
  );
  context.closePath();
  context.stroke();
}

function renderLine(x1,y1, x2,y2) {
  context.fillStyle = "#4b5b79";
  context.lineWidth = 2;
  context.fillRect(
    x1 * cellSize - 4,
    y1 * cellSize - 4,
    (x2 - x1) * cellSize + 4,
    (y2 - y1) * cellSize + 4
  );
}

function renderLine2(x1,y1, x2,y2) {
  context.strokeStyle = "#3e5360";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x1 * cellSize, y1 * cellSize);
  context.lineTo(x2 * cellSize, y2 * cellSize);
  context.closePath();
  context.stroke();
}

function renderAngle(x, y, angle) {
  const rayLength = 1;
  context.strokeStyle = "#b33838";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(x * cellSize, y * cellSize);
  context.lineTo(
    (x + Math.cos(angle) * rayLength) * cellSize,
    (y + Math.sin(angle) * rayLength) * cellSize
  );
  context.closePath();
  context.stroke();
}


//--------------------------------------------------------------------------------------------------------------------------------|Math Functions
function clearScreen() {
  context.fillStyle = "#282828";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function roundRadian(num) {
  return ((num % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function getAngle(x1,y1, x2,y2) {
  //const adj = x2 - x1 > 0 ? x2 - x1 : x1 - x2;
  const adj = x2 - x1;
  const opp = y2 - y1;
  //return x2-x1>0 ? Math.atan(opp/adj) : Math.atan(opp/adj) + Math.PI;
  //return ((Math.atan(opp/adj) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  return adj >= 0
  ? ((Math.atan(opp/adj) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI)
  : (((Math.atan(opp/adj) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI)) - Math.PI;
  //return Math.atan2(opp,adj);
}


//--------------------------------------------------------------------------------------------------------------------------------|Movement
function movePlayer() {
  player.x += Math.cos(player.angle) * player.speed;
  player.y += Math.sin(player.angle) * player.speed;
}

document.addEventListener("keydown", (e) => {
  if (e.key == "w") {
    player.speed = player.speedMod;
  }
  if (e.key == "s") {
    player.speed = -player.speedMod;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key == "w" || e.key == "s") {
    player.speed = 0;
  }
});

document.addEventListener("mousemove", function (event) {
  player.angle += roundRadian(toRadians(event.movementX));
});
