"use strict";

let canvas = document.querySelector("canvas"),
  statusArea = document.querySelector(".status-area"),
  resetBtn = document.querySelector("button"),
  status = document.createElement("span"),
  gameOverDialogBox = document.querySelector(".gameOverDialogBox"),
  totalMovesHeading = document.querySelector(".totalMovesHeading"),
  context = canvas.getContext("2d");

canvas.height = 405;
canvas.width = 405;
if (window.innerWidth < 600) {
  canvas.height = 370;
  canvas.width = 370;
}

let cellWidth = Math.floor(canvas.width / 9),
  canvasWidth = canvas.width,
  radius = Math.floor(cellWidth / 2) - 4,
  circleCellCoordinates = [],
  selectedCircle = undefined,
  moves = 0;

status.innerText = "Moves: " + moves;
statusArea.insertBefore(status, statusArea.childNodes[0]);

//Create grid
createGrid();
function createGrid() {
  for (let i = 0.5; i < canvasWidth; i += cellWidth) {
    //Vertical lines
    context.moveTo(i, 0);
    context.lineTo(i, canvasWidth - 0.5);

    //Horizontal lines
    context.moveTo(0, i);
    context.lineTo(canvasWidth - 0.5, i);
  }

  context.strokeStyle = "#aaa";
  context.stroke();

  context.strokeStyle = "black";
}

if (window.localStorage) {
  if (localStorage.gameInProgress === "true") {
    //console.log("Game in progress");
    moves = parseInt(localStorage.moves);
    selectedCircle = parseInt(localStorage.selectedCircle);

    for (let i = 0; i < 9; i++) {
      circleCellCoordinates[i] = {
        x: parseInt(localStorage["circle" + i + "X"]),
        y: parseInt(localStorage["circle" + i + "Y"]),
      };
    }

    updateStatus();
  } else newGame();
} else newGame();

function newGame() {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 6; j < 9; j++) {
      let x = i * cellWidth,
        y = j * cellWidth;
      circleCellCoordinates[count] = { x, y };
      count++;
    }
  }
}

function isGameOver() {
  let flag = 0;
  const X = canvasWidth - cellWidth * 3 - 1;
  const Y = 2 * cellWidth;

  console.log(X, Y);

  for (let i = 0; i < 9; i++) {
    if (!(circleCellCoordinates[i].x >= X && circleCellCoordinates[i].y <= Y)) {
      flag = 1;
      break;
    }
  }

  if (flag === 0) {
    totalMovesHeading.textContent = "Total Moves: " + moves;
    gameOverDialogBox.showModal();
  } else return false;
}

createCircles();
function createCircles() {
  clearCircles();
  let count = 0;
  circleCellCoordinates.forEach((coordinate) => {
    let x = coordinate.x + cellWidth / 2,
      y = coordinate.y + cellWidth / 2;
    context.beginPath();

    if (count === selectedCircle) {
      context.fillStyle = "#f76262";
    } else {
      context.fillStyle = "#ddd";
    }
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    count++;
  });
}

function clearCircles() {
  circleCellCoordinates.forEach((coordinate) => {
    context.clearRect(
      coordinate.x + 1.5,
      coordinate.y + 0.5,
      cellWidth - 1,
      cellWidth - 1
    );
  });
}

let lastSelectedCircle;
canvas.onclick = (e) => {
  let mouseX = e.offsetX,
    mouseY = e.offsetY,
    //Upper left coordinate of selected cell
    x = Math.floor(mouseX / cellWidth) * cellWidth,
    y = Math.floor(mouseY / cellWidth) * cellWidth;

  let c = containsCircle(x, y);
  if (c !== false) selectedCircle = c;
  else if (canMove(x, y)) {
    move(x, y);
    isGameOver();
  } else selectedCircle = undefined;

  createCircles();

  saveGameState();
};

function containsCircle(x, y) {
  for (let i = 0; i < 9; i++) {
    if (circleCellCoordinates[i].x === x && circleCellCoordinates[i].y === y) {
      return i;
    }
  }
  return false;
}

function updateStatus() {
  status.innerText = "Moves: " + moves;
}

let jumping = false;
function canMove(x, y) {
  let selectedCircleX = circleCellCoordinates[selectedCircle].x,
    selectedCircleY = circleCellCoordinates[selectedCircle].y;

  //Can move to adjacent empty cell
  if (
    Math.abs(x - selectedCircleX) < cellWidth + 1 &&
    Math.abs(y - selectedCircleY) < cellWidth + 1
  ) {
    moves++;
    updateStatus();
    jumping = false;
    return true;
  }

  //Can jump to second cell
  let xDiff = (selectedCircleX - x) / 2,
    yDiff = (selectedCircleY - y) / 2;

  if (containsCircle(x + xDiff, y + yDiff) !== false) {
    if (!jumping) {
      moves++;
      updateStatus();
      jumping = true;
    } else if (lastSelectedCircle === selectedCircle) jumping = true;
    else {
      moves++;
      updateStatus();
    }

    return true;
  }
}

function move(x, y) {
  clearCircles();
  circleCellCoordinates[selectedCircle].x = x;
  circleCellCoordinates[selectedCircle].y = y;
  lastSelectedCircle = selectedCircle;
  selectedCircle = undefined;
}

function resetGame() {
  selectedCircle = undefined;
  moves = 0;
  jumping = false;
  updateStatus();
  newGame();
  createCircles();

  localStorage.clear();
}

resetBtn.onclick = () => {
  clearCircles();
  resetGame();
};

gameOverDialogBox.addEventListener("close", () => {
  clearCircles();
  resetGame();
});

//------------- Local Storage ----------------
let gameInProgress = true;
function saveGameState() {
  if (window.localStorage) {
    localStorage.gameInProgress = gameInProgress;
    for (let i = 0; i < 9; i++) {
      localStorage["circle" + i + "X"] = circleCellCoordinates[i].x;
      localStorage["circle" + i + "Y"] = circleCellCoordinates[i].y;
    }

    localStorage.moves = moves;
    localStorage.selectedCircle = selectedCircle;
  }
}
