//--------------------------------------------------------------------------------------------------------------------------------|Variables
console.log(window.innerWidth);
console.log(window.innerHeight);

var lines = [];
const mapTable = document.getElementById("mapTable");
const printDiv = document.getElementById("printDiv");
const printDiv_inner = document.getElementById("printDiv-inner");
const numChangeOptions = [
  document.getElementById('numChange-0'),
  document.getElementById('numChange-1'),
  document.getElementById('numChange-2'),
  document.getElementById('numChange-3'),
  document.getElementById('numChange-4')
];


//--------------------------------------------------------------------------------------------------------------------------------|Create Table
function createTable(array) {
  array.forEach((item, i) => {
    lines[i] = document.createElement("tr");
    item.forEach((item2, i2) => {
      var cell = document.createElement("td");
      cell.classList.add('cell-' + item2);
      cell.innerHTML = item2;

      cell.onmousedown = function(e) {
        //console.log(i2 + " - " + i);
        cell.classList.remove('cell-' + this.innerHTML);
        currentMap[i][i2] = numChange;
        cell.classList.add('cell-' + numChange);
        this.innerHTML = numChange;
      };
      cell.onmouseover = function(e) {
        if (mouseIsDown) {
          cell.classList.remove('cell-' + this.innerHTML);
          currentMap[i][i2] = numChange;
          cell.classList.add('cell-' + numChange);
          this.innerHTML = numChange;
        }
      }

      var xPos = i2;
      var yPos = i;
      if (i2 < 10) { xPos = "0" + i2; }
      if (i < 10) { yPos = "0" + i; }
      cell.title = "x: " + xPos + "  |  y: " + yPos;
      lines[i].appendChild(cell);
    });

    lines[i].id = "line" + i;
    mapTable.appendChild(lines[i]);
  });
}


//--------------------------------------------------------------------------------------------------------------------------------|Print Div Section
var printDivVisible = false;

/*function printTable(tableIn) {
  var outputText = "[\n";
  for (var row=0; row<tableIn.rows.length; row++) {
    outputText += "[";
    for (var col=0; col<tableIn.rows[row].cells.length; col++) {
      //console.log(tableIn.rows[row].cells[col].innerHTML);
      outputText += tableIn.rows[row].cells[col].innerHTML;
      if (col < tableIn.rows[row].cells.length-1) { outputText += ", "; }
    }

    if (row < tableIn.rows.length-1) { outputText += "],\n";
    } else { outputText += "]\n"; }
  }
  outputText += "];";
  return outputText;
}*/
function printTable(array) {
  var outputText = "[\n";
  for (var row=0; row<array.length; row++) {
    outputText += "  [";
    for (var col=0; col<array[row].length; col++) {
      outputText += array[row][col];
      if (col < array[row].length-1) { outputText += ", "; }
    }

    if (row < array.length-1) { outputText += "],\n";
    } else { outputText += "]\n"; }
  }
  outputText += "];";
  return outputText;
}

function movePrintDiv() {
  printDivVisible = !printDivVisible;
  console.log("printDivVisible = " + printDivVisible);
  if (printDivVisible) {
    //printDiv_inner.innerHTML = printTable(mapTable);
    //printDiv_inner.innerHTML = printTable(currentMap);
    printDiv_inner.value = printTable(currentMap);
    printDiv_inner.select();

    printDiv.style['left'] = "0%";
    //printDiv.style['opacity'] = "100%";
    //printDiv.style['background'] = "#2f3336f0";
    document.documentElement.style.setProperty('--printDiv-hoverTrans', 'translateX(0)');
    document.documentElement.style.setProperty('--printDiv-hoverColor', '#2a2e30f0');
    document.documentElement.style.setProperty('--printDiv-color', '#2a2e30f0');
    //document.documentElement.style.setProperty('--printDiv-hoverOpacity', '100%');
    //document.documentElement.style.setProperty('--printDiv-transitionTime', '1.4s');
  } else {
    printDiv.style['left'] = "-98.5%";
    //printDiv.style['opacity'] = "20%";
    //printDiv.style['background'] = "#9090901c";
    document.documentElement.style.setProperty('--printDiv-hoverTrans', 'translateX(1.4%)');
    document.documentElement.style.setProperty('--printDiv-hoverColor', '#90909034');
    document.documentElement.style.setProperty('--printDiv-color', '#9090901c');
    //document.documentElement.style.setProperty('--printDiv-hoverOpacity', '38%');
    //document.documentElement.style.setProperty('--printDiv-transitionTime', '.4s');
  }
}

function stopMovePrintDiv(e) {
  if (printDivVisible) { e.stopPropagation(); }
}


//--------------------------------------------------------------------------------------------------------------------------------|Options Section
var numChange = 0;
var previousNumChange = 0;

function setNumChange(num) {
  if (num != previousNumChange) {
    numChange = num;
    numChangeOptions[numChange].style['border'] = '2px solid #ced8dc98';
    numChangeOptions[previousNumChange].style['border'] = '1px solid #919a9e88';
    previousNumChange = num;
  }
  /*numChangeOptions.forEach((item, i) => {
    if (i == num) {
      item.style['border'] = "2px solid #ced8dc98";
    } else {
      item.style['border'] = "1px solid #919a9e88";
    }
  });*/
}


//--------------------------------------------------------------------------------------------------------------------------------|Event Listeners & Initialization
var mouseIsDown = false;

document.addEventListener("mousedown", (e) => { mouseIsDown = true; });
document.addEventListener("mouseup", (e) => { mouseIsDown = false; });


//--------------------------------------------------------------------------------------------------------------------------------|Initialization
function init() { // ran by body's onload event
  createTable(currentMap);
  //setNumChange(0);
  document.getElementById('numChange-0').style['border'] = '2px solid #ced8dc98';
}
