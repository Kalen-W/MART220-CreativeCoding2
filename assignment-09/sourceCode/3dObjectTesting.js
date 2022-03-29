function preload() {
  testTexture = loadImage('./assets/textures/textureTest.png');
}

function setup() {
  p5Canvas = createCanvas(screenW, screenH, WEBGL);
  p5Canvas.position(0, 0, 'absolute');
  p5Canvas.style("display", "block");
  p5Canvas.style("z-index", "1");

  textureWrap(REPEAT, REPEAT);
}

function draw() {
  // clear();
  // push();
  //   translate(0, 0, 0);
  //   rotateY(frameCount * 0.01);
  //   box(512);
  // pop();

  if (pause) {
    clear();
    push();
      translate(0, 0, 0);
      rotateX(frameCount * 0.01);
      rotateY(frameCount * 0.01);
      rotateZ(-frameCount * 0.02);
      box(256);
    pop();
    renderHealthVile_simple(center.x*0.68,0,0, frameCount*0.01,-frameCount*0.02,frameCount*0.01, 160);
    renderHealthVile_simple(-center.x*0.68,0,0, -frameCount*0.02,frameCount*0.01,frameCount*0.01, 160);
    return;
  }
  clear();


  // line(-256,0,0, 256,0,0);

  // renderHealthVile(0,0,0);
  // renderHealthVile_simple(-894,386,0, 0,frameCount*0.02,0, 68);
  renderHealthVile_simple(-center.x*0.928,center.y*0.76,0, 0,frameCount*0.02,0, 68);
}

function renderHealthVile_simple(x,y,z, rx,ry,rz, u) {
  push();
    texture(testTexture);
    translate(x,y,z);
    doublePyramid(0,    0,        0,    rx,   ry,   rx,   u);
    doublePyramid(0,    -1.25*u,  0,    rx,   ry,   rx,   0.25*u);
    doublePyramid(0,    1.25*u,   0,    rx,   ry,   rx,   0.25*u);
  pop();
}

function doublePyramid(x,y,z, rx,ry,rz, u) {
  push();
    rotateX(rx);
    rotateY(ry);
    rotateZ(rz);
    translate(x, y+0.625*u, z)

    cone(0.5*u, 1.25*u, 5);
    translate(0, -1.25*u, 0)
    rotateX(Math.PI);
    cone(-0.5*u, 1.25*u, 5);
  pop();
}

function renderHealthVile(x,y,z) {
  var u = 64;
  beginShape();
  // // Left Edge
  // vertex(x,           y,          z);
  // vertex(x-0.5*u,     y-0.5*u,    z);
  // vertex(x-0.25*u,    y-u,        z);
  // vertex(x-u,         y-3*u,      z);
  // vertex(x-0.25*u,    y-5*u,      z);
  // vertex(x-0.5*u,     y-5.5*u,    z);
  // vertex(x,           y-6*u,      z);
  //
  // // Front Edge
  // vertex(x,           y,          z);
  // vertex(x,           y-0.5*u,    z-0.5*u);
  // vertex(x,           y-u,        z-0.25*u);
  // vertex(x,           y-3*u,      z-u);
  // vertex(x,           y-5*u,      z-0.25*u);
  // vertex(x,           y-5.5*u,    z-0.5*u);
  // vertex(x,           y-6*u,      z);
  //
  // // Right Edge
  // vertex(x,           y,          z);
  // vertex(x+0.5*u,     y-0.5*u,    z);
  // vertex(x+0.25*u,    y-u,        z);
  // vertex(x+u,         y-3*u,      z);
  // vertex(x+0.25*u,    y-5*u,      z);
  // vertex(x+0.5*u,     y-5.5*u,    z);
  // vertex(x,           y-6*u,      z);
  //
  // // Back Edge
  // vertex(x,           y,          z);
  // vertex(x,           y-0.5*u,    z+0.5*u);
  // vertex(x,           y-u,        z+0.25*u);
  // vertex(x,           y-3*u,      z+u);
  // vertex(x,           y-5*u,      z+0.25*u);
  // vertex(x,           y-5.5*u,    z+0.5*u);
  // vertex(x,           y-6*u,      z);


  // Left Edge
  vertex(x,           y,          z);
  vertex(x-0.5*u,     y-0.5*u,    z);
  vertex(x,           y-0.5*u,    z-0.5*u);
  vertex(x,           y,          z);

  // vertex(x-0.25*u,    y-u,        z);
  // vertex(x-u,         y-3*u,      z);
  // vertex(x-0.25*u,    y-5*u,      z);
  // vertex(x-0.5*u,     y-5.5*u,    z);
  // vertex(x,           y-6*u,      z);
  //
  // // Front Edge
  // vertex(x,           y,          z);
  // vertex(x,           y-0.5*u,    z-0.5*u);
  // vertex(x,           y-u,        z-0.25*u);
  // vertex(x,           y-3*u,      z-u);
  // vertex(x,           y-5*u,      z-0.25*u);
  // vertex(x,           y-5.5*u,    z-0.5*u);
  // vertex(x,           y-6*u,      z);
  //
  // // Right Edge
  // vertex(x,           y,          z);
  // vertex(x+0.5*u,     y-0.5*u,    z);
  // vertex(x+0.25*u,    y-u,        z);
  // vertex(x+u,         y-3*u,      z);
  // vertex(x+0.25*u,    y-5*u,      z);
  // vertex(x+0.5*u,     y-5.5*u,    z);
  // vertex(x,           y-6*u,      z);
  //
  // // Back Edge
  // vertex(x,           y,          z);
  // vertex(x,           y-0.5*u,    z+0.5*u);
  // vertex(x,           y-u,        z+0.25*u);
  // vertex(x,           y-3*u,      z+u);
  // vertex(x,           y-5*u,      z+0.25*u);
  // vertex(x,           y-5.5*u,    z+0.5*u);
  // vertex(x,           y-6*u,      z);
  endShape();
}
