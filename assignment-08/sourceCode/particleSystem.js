//--------------------------------------------------------------------------------------------------------------------------------|Variables
var floor = screenH;

const overlayParticles = [];
const worldParticles = [];
const maxParticles = 2048;


//--------------------------------------------------------------------------------------------------------------------------------|Particle Types
const particleTypes = {
  /*test: {
    vxRange: 1.2, vxStart: -0.6,
    vyRange: -4, vyStart: -4,
    gravity: 0.08,
    alphaStart: 255,
    decayRate: 0.4,
    alphaEnd: 5,
    widthRange: 12, widthStart: 2,
    heightRange: 'width', heightStart: 'width',
    color: '#458095',
  },*/
  smoke: {
    vxRange: 18, vxStart: -9,
    vyRange: -22, vyStart: -4,
    gravity: -0.4,
    alphaStart: 240,
    decayRate: 20,
    alphaEnd: 0,
    widthRange: 26, widthStart: 20,
    heightRange: 'width', heightStart: 'width',
    color: '#5d6c6f',
    texture: null,
  },
  gibs: {
    vxRange: 0.6, vxStart: -0.3,
    vyRange: 0.6, vyStart: -0.3,
    gravity: -0.02,
    alphaStart: 250,
    decayRate: 5,
    alphaEnd: 0,
    widthRange: 12, widthStart: 2,
    heightRange: 'width', heightStart: 'width',
    color: '#458095',
    texture: new Texture("enemySprites/gibs-test.png"),
  },
};


//--------------------------------------------------------------------------------------------------------------------------------|Particle Class
class Particle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;

    this.type = particleTypes[type];

    this.vx = (Math.random() * this.type.vxRange) + this.type.vxStart;
    this.vy = (Math.random() * this.type.vyRange) + this.type.vyStart;

    // this.g = this.type.gravity;

    this.alpha = this.type.alphaStart;
    // this.decayRate = this.type.decayRate;
    // this.alphaEnd = this.type.alphaEnd;

    this.width = Math.floor(Math.random() * this.type.widthRange) + this.type.widthStart;
    if (this.type.heightRange == 'width') {
      this.height = this.width;
    } else {
      this.height = Math.floor(Math.random() * this.type.heightRange) + this.type.heightStart;;
    }

    this.halfWidth = this.width * 0.5;
    this.halfHeight = this.height * 0.5;
  }

  finished() {
    return this.alpha <= this.type.alphaEnd;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.type.decayRate;
    if (this.alpha < 0) { this.alpha = 0; }

    this.velocityUpdate();
  }
}


class OverlayParticle extends Particle {
  constructor(x, y, type) {
    super(x, y, type);
  }

  render() {
    overlayContext.lineWidth = 0;
    overlayContext.strokeStyle = '#00000000';
    overlayContext.fillStyle = this.type.color + toHex(this.alpha);
    overlayContext.fillRect(this.x-this.halfWidth,this.y-this.halfHeight, this.width,this.height);
  }

  velocityUpdate() {
    if (this.y >= floor) {
      this.y = floor;
      this.vy *= -0.8;
      this.vx *= 0.996;
      return;
    }

    this.vy += this.type.gravity;
  }

  bounce() {
    if (this.vx < 2) {
      this.vx *= 1.004;
    }

    if (this.y >= floor) {
      this.y = floor;
      //this.vy = 0;
      this.vy *= -1;
    } else if (this.y <= 0) {
      this.vy *= -1;
    }

    if (this.x <= 0 || this.x >= screenW) {
      this.vx *= -1;
    }
  }
}


class WorldParticle extends Particle {
  constructor(x, y, heightLevel, type) {
    super(x, y, type);
    this.heightLevel = heightLevel;
    this.heightVelocity = 0.02;
    this.heightMod = 0.2;
  }

  render() {
    context.lineWidth = 0;
    context.strokeStyle = '#00000000';
    context.fillStyle = this.type.color + toHex(this.alpha);
    context.fillRect(this.x-this.halfWidth,this.y-this.halfHeight, this.width,this.height);
  }

  velocityUpdate() {
    if (this.heightLevel < 0) {
      this.heightMod = 0;
      this.heightLevel = 0;
      this.vy *= 0.98;
      this.vx *= 0.98;
      return;
    }
    //console.log(this.distance * 0.01);
    this.heightVelocity += this.type.gravity;
    //this.heightVelocity = Math.round( this.heightVelocity + (this.type.gravity * (this.distance * 0.01)) )
    //console.log(this.heightVelocity + " | " + ( this.heightVelocity + (this.type.gravity * (this.distance * 0.01)) ));
    this.heightMod += this.heightVelocity;
    if (this.heightLevel <= 0) {
      this.heightMod = 0;
      this.heightLevel = 0;
      this.heightVelocity *= -1;
    }

    // if (this.vx > .01 || this.vx < -.01) {
    //   this.vx *= 0.9;
    // } else {
    //   this.vx = 0;
    // }
    //
    // if (this.vy > .01 || this.vy < -.01) {
    //   this.vy *= 0.9;
    // } else {
    //   this.vy = 0;
    // }
    //console.log(this.heightLevel);
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Create Paticles
function createOverlayParticles(x, y, amount, type) {
  if (overlayParticles.length > maxParticles) { return; }

  for (var i=0; i<amount; i++) {
    overlayParticles.push( new OverlayParticle(x, y, type) );
  }
}

function createWorldParticles(x, y, heightLevel, amount, type) {
  if (worldParticles.length > maxParticles) { return; }

  for (var i=0; i<amount; i++) {
    worldParticles.push( new WorldParticle(x, y, heightLevel, type) );
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Update Paticles
function updateOverlayParticles() {
  if (overlayParticles.length <= 0) { return; }

  overlayParticles.forEach((particle, i) => {
    if (!pause) {
      particle.update();
    }

    particle.render();

    if (particle.finished()) {
      overlayParticles.splice(i, 1);
    }
  });
}

function updateWorldParticles() {
  if (worldParticles.length <= 0) { return; }

  worldParticles.forEach((particle, i) => {
    if (!pause) {
      particle.update();
    }

    //particle.render();

    if (particle.finished()) {
      worldParticles.splice(i, 1);
    }
  });
}




function renderWorldParticles(rays) {
  sortParticles(worldParticles);

  var heightOffset = player.verticalAngle * heightOffsetMult;

  for (var i=0; i<worldParticles.length; i++) {
    var particle = worldParticles[i];
    if (particle.type.texture) {
      var img = particle.type.texture.img;
    }

    var dx = particle.dx;
    var dy = particle.dy;

    particle.angle = Math.atan2(dy, dx);
    var angle = particle.angle - player.angle;
    if (angle < -Math.PI) { angle += twoPi }
    if (angle >= Math.PI) { angle -= twoPi }

    // if particle is outside view range: continue to next particle
    if (angle < -fov*0.65 || angle > fov*0.65) { continue; }

    var dist = particle.distance;
    var size = (viewDist * cellSize) / (Math.cos(angle) * dist);
    size = size - (size % options.lineWidth); // Aligns sprite with ray lines.

    if (size <= 0) { continue; }

    var jumpHeight = player.jumpHeight / dist;
    var x = Math.tan(angle) * viewDist;
    var screenXPos = Math.round(center.x + x - size / 2);
    screenXPos = screenXPos - (screenXPos % options.lineWidth); // Aligns sprite with ray lines.

    var screenXPosEnd = screenXPos + size;
    var top = Math.round(center.y - ((size - heightOffset - jumpHeight) / 2));

    // particle.heightLevel = top * particle.heightMod;
    // console.log(top + " | " + (top - (top * particle.heightMod)));
    // top -= particle.heightLevel;

    // Iterates over sprite x position drawing the sprite one strip at a time.
    for (var strip=screenXPos; strip < screenXPosEnd; strip += options.lineWidth) {
      // Insures a strip isn't drawn if its off screen.
      if (strip < 0) { continue; }
      if (strip >= screenW) { break; }

      // Insures a strip isn't drawn if the (wall) ray it aligns with is closer to the player.
      var rayI = strip / options.lineWidth;
      if (rays[rayI] && rays[rayI].distance < dist) { continue; }

      // Determines which column of the texture to draw.
      const textureX = Math.floor( ((strip - screenXPos) / size) * textureRez );

      // Draws the strip
      context.globalAlpha = particle.alpha / 255;
      context.drawImage(img, textureX,0, 1,textureRez, strip,top, options.lineWidth,size);
    }
  }
  context.globalAlpha = 1;
}


function sortParticles(sprites) {
  for (var i=0; i<sprites.length; i++) {
    var sprite = sprites[i];
    var dx = sprite.x - player.x;
    var dy = sprite.y - player.y;
    sprite.dx = dx;
    sprite.dy = dy;
    sprite.distance = Math.round(Math.sqrt(dx*dx + dy*dy));
  }
  sprites.sort((a, b) => { return b.distance - a.distance; });
}
