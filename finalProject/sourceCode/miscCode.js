// Kalen Weinheimer
// 03-07-2022

// This project is based off the following tutorial: youtu.be/5nSFArCgCXA
// This tutorial's code can also be found on GitHub: github.com/satansdeer/raycaster

// Additional features, such as wall texture rendering, figured out with the assistance of the additional following tutorials:
// dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/
// permadi.com/1996/05/ray-casting-tutorial-table-of-contents/
// lodev.org/cgtutor/raycasting.html

// To Do:
// ================================
// Sky and floor texture rendering
// Weapon, hitscan, and projectile systems
// Fix sprite/enemy rendering (so they don't appear to slide when rotating)
// Options menu (using HTML)
// Fix rendering order between enemies and sprites
// Distance based texture altering (making textures darker if further away) - ?
// Rework sprite collision (make it circular / distance based)
// Touchscreen control options
// Gamepad API (developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) - ?


//--------------------------------------------------------------------------------------------------------------------------------|Options Functions
function toggleMinimap() {
  options.minimap = !options.minimap;
}


var mapEditorVisible = false;
function toggleMapEditor() {
  mapEditorVisible = !mapEditorVisible;
  console.log("mapEditorVisible = " + mapEditorVisible);
  var mapEditor = document.getElementById('mapEditor-container');

  if (mapEditorVisible) {
    pauseUpdate(true);
    localStorage.setItem('mapEditorReturn', JSON.stringify(
      { visible: true, mapData: currentMap }
    ));

    mapEditor.style.display = "block";
    document.getElementById('mapEditor-frame').contentWindow.focus();
    //setTimeout(toggleMapEditor, 8000);
  } else {
    var mapEditorReturn = JSON.parse(localStorage.getItem('mapEditorReturn'));
    currentMap = mapEditorReturn.mapData;

    window.focus();
    mapEditor.style.display = "none";
    pauseUpdate(false);
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Map Change Test
/*var mapChangeFreq = 12; // in number of ticks
var mapChangeVal = 0;
function mapChangeTest() {
  if (totalLogicTicks % mapChangeFreq == 0) {
    if (mapChangeVal < 7) {
      mapChangeVal++;
    } else {
      mapChangeVal = 0;
    }
    currentMap = testMapArray[mapChangeVal];
    mapWidth = currentMap[0].length;
    mapHeight = currentMap.length;
  }
}*/

// TODO: This may need to be reworked.
const mapChangeTest = {
  changeFreq: 12, // in number of ticks
  changeVal: 0,
  func: function() {
    if (totalLogicTicks % this.changeFreq == 0) {
      if (this.changeVal < 7) {
        this.changeVal++;
      } else {
        this.changeVal = 0;
      }
      currentMap = testMapArray[this.changeVal];
      mapWidth = currentMap[0].length;
      mapHeight = currentMap.length;
    }
  }
};

//--------------------------------------------------------------------------------------------------------------------------------|Animated Walls Test
var aniWallArray = [
  [0,128, 128,64, 0,128, 128,64],
  [0,192, 128,64, 0,128, 128,64]
];

// TODO: Replace usage of this with the animated texture system/class.
// This will most likely (/most easily) require seperating wall textures into seperate image files.
// Not redrawing the canvas would also probably be better for performance, and make it less likely for some bug to occur.
var lastAnimatedWallsUpdate = 0;
var nextAnimatedWallsUpdate = 1000;
var displayedAnimatedWall = 0;
function animatedWalls(now) {
  if (texturesLoaded && now >= nextAnimatedWallsUpdate) {
    // aniWallArray.push(aniWallArray[0]);
    // aniWallArray.shift();
    if (displayedAnimatedWall < 1) {
      displayedAnimatedWall++;
    } else {
      displayedAnimatedWall = 0;
    }
    var disp = displayedAnimatedWall;

    /*wallsContext.drawImage(wallsImg,
      aniWallArray[0][0],aniWallArray[0][1],
      aniWallArray[0][2],aniWallArray[0][3],
      aniWallArray[0][4],aniWallArray[0][5],
      aniWallArray[0][6],aniWallArray[0][7]
    );*/
    wallsContext.drawImage(wallsImg,
      aniWallArray[disp][0],aniWallArray[disp][1],
      aniWallArray[disp][2],aniWallArray[disp][3],
      aniWallArray[disp][4],aniWallArray[disp][5],
      aniWallArray[disp][6],aniWallArray[disp][7]
    );

    lastAnimatedWallsUpdate = now;
    nextAnimatedWallsUpdate = now + 1000;
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Item Pickup Test
function itemPickupCheck() {
  // globalLootArray.forEach((item, i) => {
  //   if (Math.floor(player.x/cellSize) == item.x && Math.floor(player.y/cellSize) == item.y) {
  //     console.log(item);
  //   }
  // });
  for (var i=0; i<globalLootArray.length; i++) {
    item = globalLootArray[i];
    if (Math.floor(player.x/cellSize) == item.x && Math.floor(player.y/cellSize) == item.y) {
      console.log(item);
    }
  }
}
