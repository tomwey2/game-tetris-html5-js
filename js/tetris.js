"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const titel = document.getElementById("titel");
const fps = 60;

// colors
const BOARD_BACKGROUND_COLOR_DARK = "#333300";
const BOARD_BACKGROUND_COLOR_LIGHT = "#E5E5CC";
const TEXT_COLOR_NORMAL = "#4C4C4C";
const TEXT_COLOR_DARK = "#202020";
const TEXT_COLOR_LIGHT = "#808080";
const TEXT_COLOR_TERIS = "#FF00FF";

// game states
const GAME_INIT = "GAME_INIT";
const GAME_READY = "GAME_IS_READY";
const GAME_IS_RUNNING = "GAME_IS_RUNNING";
const GAME_IS_OVER = "GAME_IS_OVER";
const GAME_IS_PAUSED = "GAME_IS_PAUSED";

// dimensions
const BOARD_ROWS = 22; // the upper two rows are not shown
const BOARD_VISIBLE_ROWS = 20;
const BOARD_COLS = 10;
const CELL_WIDTH = canvas.height / (BOARD_VISIBLE_ROWS + 2); // incl top and bottom margin
const BOARD_WIDTH = CELL_WIDTH * (BOARD_COLS + 2);
const INFO_BOARD_WIDTH = canvas.width - BOARD_WIDTH - CELL_WIDTH;
const INFO_BOARD_CENTER = BOARD_WIDTH + INFO_BOARD_WIDTH / 2;

// game dynamic
//         Level:     0     1    2    3    4    5    6   7   8   9  10 and more
const LEVEL_SPEED = [1000, 800, 600, 400, 200, 100, 90, 80, 70, 60, 50];
const SPEED_DROPDOWN = 50;

// game variables
let gameInterval = setInterval(gameloop, 1000 / fps);
let board = Array(BOARD_ROWS)
  .fill()
  .map(() => Array(BOARD_COLS).fill(0));
let gameState = GAME_INIT;
let gameScore = 0;
let gameLevel = 0;
let gameLines = 0;
let currentTetromino = TETROMINO_I;
let currentOffset = [0, 0];
let updateIntervall = 0;
let rotationIndex = 0;
let nextTetrominos = [];
let nextTetromino = 0;

function gameloop() {
  console.log("state=" + gameState);

  switch (gameState) {
    case GAME_INIT: // initialize the game and go to state READY
      gameInit();
      break;
    case GAME_READY: // print "ready" and wait for keypressed
      draw();
      drawMessage("Get Ready!");
      break;
    case GAME_IS_RUNNING: // run the game until it is over
      draw();
      break;
    case GAME_IS_OVER: // print "game is over" and wait for keypressed and go to INIT
      draw();
      drawMessage("Game Over!");
      break;
  }
}

window.addEventListener("keydown", (event) => {
  let k = event.keyCode;
  let key = event.key;

  const keyPressedLeft = k == 37 || k == 65; // LEFT || A
  const keyPressedRight = k == 39 || k == 68; // RIGHT || D
  const keyPressedUp = k == 38 || k == 76; // UP || L
  const keyPressedDown = k == 40 || k == 77; // DOWN || M
  const keyPressedSpace = k == 32; // SPACE
  const keyPressedEsc = k == 27; // ESC
  const keyPressedP = key == "p" || key == "P";

  setTimeout(() => {
    switch (gameState) {
      case GAME_READY:
        if (keyPressedSpace) {
          gameState = GAME_IS_RUNNING;
        }
        break;
      case GAME_IS_RUNNING:
        if (keyPressedLeft) {
          moveLeftTetromino();
        } else if (keyPressedRight) {
          moveRightTetromino();
        } else if (keyPressedUp) {
          rotateClockwise();
        } else if (keyPressedDown || keyPressedSpace) {
          hardDropTetromino();
        } else if (keyPressedP) {
          gameState = GAME_IS_PAUSED;
        } else if (keyPressedEsc) {
          gameState = GAME_IS_OVER;
        }
        break;
      case GAME_IS_PAUSED:
        if (keyPressedSpace) {
          gameState = GAME_IS_RUNNING;
        } else if (keyPressedEsc) {
          gameState = GAME_IS_OVER;
        }
        break;
      case GAME_IS_OVER:
        if (keyPressedSpace) {
          gameState = GAME_INIT;
        }
        break;
    }
  }, 1);
});

function setSpeed(speed) {
  if (updateIntervall != 0) {
    clearInterval(updateIntervall);
  }
  updateIntervall = setInterval(() => update(), speed);
}

function getNextTetromino() {
  currentTetromino = nextTetrominos.pop();
  if (nextTetrominos.length == 0) {
    nextTetrominos = shuffle(ALL_TETROMINOS.slice());
  }
  nextTetromino = nextTetrominos.at(nextTetrominos.length - 1);
  let yOffset = BOARD_ROWS - 2; // top of the board in invisible rows
  let xOffset = currentTetromino == TETROMINO_O ? 4 : 3; // center of the board columns
  currentOffset = [yOffset, xOffset];
  rotationIndex = 0;
}

function gameInit() {
  board.forEach((row) => row.fill(0));
  gameLevel = 0;
  setSpeed(LEVEL_SPEED[gameLevel]);
  gameState = GAME_READY;
  nextTetrominos = shuffle(ALL_TETROMINOS.slice());
  getNextTetromino();
}

function update() {
  if (gameState != GAME_IS_RUNNING) return;
  moveDownTetromino();
  if (isBottom()) {
    if (isGameOver()) {
      gameState = GAME_IS_OVER;
    } else {
      setTetrominoIntoBoard();
      let lines = clearLines();
      gameLines += lines;
      gameScore += scoreOfClearLines(lines);
      getNextTetromino();
    }
    gameLevel = Math.round(gameLines / 10);
    if (gameLevel > 10) {
      gameLevel = 10;
    }
    setSpeed(LEVEL_SPEED[gameLevel]);
  }
}

function setTetrominoIntoBoard() {
  let coords = TETROMINOS[currentTetromino - 1].coords[rotationIndex];
  for (let index = 0; index < coords.length; index++) {
    let [row, col] = coords[index];
    board[row + currentOffset[0]][col + currentOffset[1]] = currentTetromino;
  }
}

function rotateClockwise() {
  let oldIndex = rotationIndex;
  rotationIndex = rotationIndex < 3 ? rotationIndex + 1 : 0;
  if (!allCoordsAreInsideOfBoard() || !allCellsOfBoardAreFree()) {
    rotationIndex = oldIndex;
  }
}

function clearLines() {
  let lines = 0;
  for (let row = BOARD_VISIBLE_ROWS - 1; row >= 0; row--) {
    if (board[row].every((cell) => cell > 0)) {
      clearLine(row);
      lines++;
    }
  }
  return lines;
}

function clearLine(line) {
  for (let row = line; row < BOARD_VISIBLE_ROWS - 1; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      board[row][col] = board[row + 1][col];
    }
  }
}

function scoreOfClearLines(lines) {
  switch (lines) {
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4: // Tetris
      return 800;
    default:
      return 0;
  }
}

function hardDropTetromino() {
  setSpeed(SPEED_DROPDOWN);
}

function currentCoords() {
  return TETROMINOS[currentTetromino - 1].coords[rotationIndex].map((coord) => [
    coord[0] + currentOffset[0],
    coord[1] + currentOffset[1],
  ]);
}

function allCoordsAreInsideOfBoard() {
  return currentCoords().every(
    (coord) =>
      coord[0] >= 0 &&
      coord[0] < BOARD_ROWS &&
      coord[1] >= 0 &&
      coord[1] < BOARD_COLS,
  );
}

function allCellsOfBoardAreFree() {
  return currentCoords().every((coord) => board[coord[0]][coord[1]] == 0);
}

function moveLeftTetromino() {
  currentOffset[1]--;
  if (!allCoordsAreInsideOfBoard() || !allCellsOfBoardAreFree()) {
    currentOffset[1]++;
  }
}

function moveRightTetromino() {
  currentOffset[1]++;
  if (!allCoordsAreInsideOfBoard() || !allCellsOfBoardAreFree()) {
    currentOffset[1]--;
  }
}

function isGameOver() {
  let rows = currentCoords().map((coord) => coord[0]);
  return Math.min(...rows) > BOARD_VISIBLE_ROWS - 2;
}

function isBottom() {
  return currentCoords().some(
    (coord) => coord[0] == 0 || board[coord[0] - 1][coord[1]] > 0,
  );
}

function moveDownTetromino() {
  if (!isBottom()) {
    currentOffset[0]--;
  }
}

function draw() {
  //drawFillRect(0, 0, canvas.width, canvas.height, BOARD_BACKGROUND_COLOR_DARK);
  for (let row = -1; row < BOARD_VISIBLE_ROWS + 1; row++) {
    for (let col = -1; col <= BOARD_COLS + 10; col++) {
      drawCell(
        row,
        col,
        TEXT_COLOR_NORMAL,
        TEXT_COLOR_LIGHT,
        TEXT_COLOR_DARK,
        false,
      );
    }
  }

  drawInfoBoard();
  drawGameBoard();
  drawTetromino(0, 0, currentTetromino, currentCoords());
  drawTetromino(12, 14, nextTetromino, TETROMINOS[nextTetromino - 1].coords[0]);
}

function drawInfoBoard() {
  ctx.drawImage(titel, 490, 30, 265, 110);

  drawFillRect(
    BOARD_WIDTH,
    CELL_WIDTH * 4,
    INFO_BOARD_WIDTH,
    CELL_WIDTH * 7,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
  drawText(
    INFO_BOARD_CENTER,
    CELL_WIDTH * 5,
    "NEXT",
    BOARD_BACKGROUND_COLOR_DARK,
    "center",
    "middle",
  );
  drawFillRect(
    BOARD_WIDTH,
    CELL_WIDTH * 12,
    INFO_BOARD_WIDTH,
    CELL_WIDTH * 9,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
  drawText(
    INFO_BOARD_CENTER,
    CELL_WIDTH * 13,
    "SCORE",
    TEXT_COLOR_LIGHT,
    "center",
    "middle",
  );
  drawText(
    INFO_BOARD_CENTER,
    CELL_WIDTH * 14,
    gameScore.toString(),
    BOARD_BACKGROUND_COLOR_DARK,
    "center",
    "middle",
  );

  drawText(
    INFO_BOARD_CENTER,
    CELL_WIDTH * 16,
    "LEVEL",
    TEXT_COLOR_LIGHT,
    "center",
    "middle",
  );
  drawText(
    INFO_BOARD_CENTER,
    CELL_WIDTH * 17,
    (gameLevel + 1).toString(),
    BOARD_BACKGROUND_COLOR_DARK,
    "center",
    "middle",
  );

  drawText(
    INFO_BOARD_CENTER,
    CELL_WIDTH * 19,
    "LINES",
    TEXT_COLOR_LIGHT,
    "center",
    "middle",
  );
  drawText(
    INFO_BOARD_CENTER,
    CELL_WIDTH * 20,
    gameLines.toString(),
    BOARD_BACKGROUND_COLOR_DARK,
    "center",
    "middle",
  );
}

function drawGameBoard() {
  drawFillRect(
    CELL_WIDTH,
    CELL_WIDTH,
    CELL_WIDTH * BOARD_COLS,
    CELL_WIDTH * BOARD_VISIBLE_ROWS,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
  for (let row = 0; row < BOARD_VISIBLE_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (board[row][col] == 0) {
        drawEmptyCell(row, col);
      } else {
        let tetromino = board[row][col];
        drawCell(
          row,
          col,
          TETROMINOS[tetromino - 1].colorNormal,
          TETROMINOS[tetromino - 1].colorLight,
          TETROMINOS[tetromino - 1].colorDark,
        );
      }
    }
  }
}

function drawTetromino(offsetRow, offsetCol, tetramino, coords) {
  for (let index = 0; index < coords.length; index++) {
    let [row, col] = coords[index];
    drawCell(
      row + offsetRow,
      col + offsetCol,
      TETROMINOS[tetramino - 1].colorNormal,
      TETROMINOS[tetramino - 1].colorLight,
      TETROMINOS[tetramino - 1].colorDark,
    );
  }
}

function drawEmptyCell(row, col) {
  let x = transformColToX(col);
  let y = transformRowToX(row);
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH,
    CELL_WIDTH + y * CELL_WIDTH,
    CELL_WIDTH,
    CELL_WIDTH,
    "#CCCCCC",
  );
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH + 1,
    CELL_WIDTH + y * CELL_WIDTH + 1,
    CELL_WIDTH - 2,
    CELL_WIDTH - 2,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
}

function drawCell(row, col, colorNormal, colorLight, colorDark, check = true) {
  let x = transformColToX(col);
  let y = transformRowToX(row);
  if (check && y < 0) return;
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH,
    CELL_WIDTH + y * CELL_WIDTH,
    CELL_WIDTH - 0,
    CELL_WIDTH - 2,
    colorLight,
  );
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH + 4,
    CELL_WIDTH + y * CELL_WIDTH + 4,
    CELL_WIDTH - 4,
    CELL_WIDTH - 4,
    colorDark,
  );
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH + 0,
    CELL_WIDTH + (y + 1) * CELL_WIDTH - 4,
    4,
    4,
    colorLight,
  );
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH + 4,
    CELL_WIDTH + y * CELL_WIDTH + 4,
    CELL_WIDTH - 8,
    CELL_WIDTH - 8,
    colorNormal,
  );
}

function drawMessage(message) {
  drawFillRect(
    CELL_WIDTH * 3,
    CELL_WIDTH * 8,
    CELL_WIDTH * 14,
    CELL_WIDTH * 5,
    BOARD_BACKGROUND_COLOR_DARK,
  );
  drawText(
    CELL_WIDTH * 10,
    CELL_WIDTH * 10,
    message,
    BOARD_BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
  );
  drawText(
    CELL_WIDTH * 10,
    CELL_WIDTH * 11,
    "Press any key to restart",
    BOARD_BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    "20px",
  );
}

function transformRowToX(row) {
  return BOARD_VISIBLE_ROWS - row - 1;
}

function transformColToX(col) {
  return col;
}
