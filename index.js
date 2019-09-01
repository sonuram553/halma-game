"use strict";

let canvas = document.querySelector("canvas"),
  status = document.querySelector(".status-area"),
  resetBtn = document.querySelector("button"),
  span = document.createElement("span"),
  context = canvas.getContext("2d"),
  cellWidth = 54,
  radius = 20,
  circleCellCoordinates = [],
  selectedCircle = undefined,
  moves = 0;

span.innerText = "Moves: " + moves;
status.insertBefore(span, status.childNodes[0]);

//Create grid
for (let i = 0.5; i <= 487; i += cellWidth) {
  //Vertical lines
  context.moveTo(i, 0);
  context.lineTo(i, 487);

  //Horizontal lines
  context.moveTo(0, i);
  context.lineTo(487, i);
}
context.strokeStyle = "#aaa";
context.stroke();

context.strokeStyle = "black";

if (!!window.localStorage) {
  if (localStorage.gameInProgress === "true") {
    //console.log("Game in progress");
    moves = parseInt(localStorage.moves);
    selectedCircle = parseInt(localStorage.selectedCircle);

    for (let i = 0; i < 9; i++) {
      circleCellCoordinates[i] = {
        x: parseInt(localStorage["circle" + i + "X"]),
        y: parseInt(localStorage["circle" + i + "Y"])
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
      circleCellCoordinates[count] = { x: x, y: y };
      count++;
    }
  }
}

function checkGame() {
  let flag = 0;
  for (let i = 0; i < 9; i++) {
    if (
      !(circleCellCoordinates[i].x >= 324 && circleCellCoordinates[i].y <= 108)
    ) {
      flag = 1;
      break;
    }
  }

  if (flag === 0) return true;
  else return false;
}

createCircles();
function createCircles() {
  clearCircles();
  let count = 0;
  circleCellCoordinates.forEach(coordinate => {
    let x = coordinate.x + 27.5,
      y = coordinate.y + 27.5;
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
  circleCellCoordinates.forEach(coordinate => {
    context.clearRect(
      coordinate.x + 1.5,
      coordinate.y + 0.5,
      cellWidth - 1,
      cellWidth - 1
    );
  });
}

let lastSelectedCircle;
canvas.onclick = e => {
  let mouseX = e.offsetX,
    mouseY = e.offsetY,
    //Upper left coordinate of selected cell
    x = Math.floor(mouseX / cellWidth) * cellWidth,
    y = Math.floor(mouseY / cellWidth) * cellWidth;

  let c = containsCircle(x, y);
  if (c) selectedCircle = c - 1;
  else if (canMove(x, y)) {
    move(x, y);
    if (checkGame()) console.log("Game over");
  } else selectedCircle = undefined;

  createCircles();

  saveGameState();
};

function containsCircle(x, y) {
  for (let i = 0; i < 9; i++) {
    if (circleCellCoordinates[i].x === x && circleCellCoordinates[i].y === y) {
      return i + 1;
    }
  }
}

function updateStatus() {
  span.innerText = "Moves: " + moves;
}

let jumping = false;
function canMove(x, y) {
  let selectedCircleX = circleCellCoordinates[selectedCircle].x,
    selectedCircleY = circleCellCoordinates[selectedCircle].y;

  //Can move to adjacent empty cell
  if (
    Math.abs(x - selectedCircleX) < 55 &&
    Math.abs(y - selectedCircleY) < 55
  ) {
    moves++;
    updateStatus();
    jumping = false;
    return true;
  }

  //Can jump to second cell
  let xDiff = (selectedCircleX - x) / 2,
    yDiff = (selectedCircleY - y) / 2;
  if (containsCircle(x + xDiff, y + yDiff)) {
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

//------------- Local Storage ----------------
let gameInProgress = true;
function saveGameState() {
  if (!!window.localStorage) {
    localStorage.gameInProgress = gameInProgress;
    for (let i = 0; i < 9; i++) {
      localStorage["circle" + i + "X"] = circleCellCoordinates[i].x;
      localStorage["circle" + i + "Y"] = circleCellCoordinates[i].y;
    }

    localStorage.moves = moves;
    localStorage.selectedCircle = selectedCircle;
  }
}
