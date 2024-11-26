"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const title = document.getElementById("title");
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
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
const IS_DESKTOP = window.innerWidth > window.innerHeight ? true : false;
console.info("canvas: " + canvas.width + "x" + canvas.height);
console.info(IS_DESKTOP ? "DESKTOP" : "PHONE");

const BOARD_ROWS = 22; // the upper two rows are not shown
const BOARD_VISIBLE_ROWS = 20;
const BOARD_COLS = 10;
const BOARD_OFFSET_Y = IS_DESKTOP ? 0 : 1;

const CELL_WIDTH = IS_DESKTOP ? canvas.height / 22 : canvas.height / 26;
canvas.width = IS_DESKTOP ? 19 * CELL_WIDTH : 12 * CELL_WIDTH;

// prints
const TEXT_FONT_NORMAL = IS_DESKTOP ? "25px" : "16px";
const TEXT_FONT_SMALL = IS_DESKTOP ? "16px" : "12px";
const SCORE_TEXT_XY = IS_DESKTOP ? [15, 13] : [2.5, 23.5];
const SCORE_TEXT_ALIGN = IS_DESKTOP ? "center" : "center";
const SCORE_VALUE_XY = IS_DESKTOP ? [15, 14] : [2.5, 24.5];
const SCORE_VALUE_ALIGN = IS_DESKTOP ? "center" : "center";
const LEVEL_TEXT_XY = IS_DESKTOP ? [15, 16] : [5.5, 23.5];
const LEVEL_TEXT_ALIGN = IS_DESKTOP ? "center" : "center";
const LEVEL_VALUE_XY = IS_DESKTOP ? [15, 17] : [5.5, 24.5];
const LEVEL_VALUE_ALIGN = IS_DESKTOP ? "center" : "center";
const LINES_TEXT_XY = [15, 19];
const LINES_TEXT_ALIGN = "center";
const LINES_VALUE_XY = [15, 20];
const LINES_VALUE_ALIGN = "center";
const TETRIS_IMAGE_XY = IS_DESKTOP ? [12, 1] : [4, 0.7];
const TETRIS_IMAGE_WIDTH = IS_DESKTOP ? 6 : 4;
const TETRIS_IMAGE_HEIGHT = IS_DESKTOP ? 2.5 : 2.0;
const TOM_TEXT_XY = IS_DESKTOP ? [15, 0.5] : [6, 0.4];
const NEXT_TETROMINO_ROW_COL = IS_DESKTOP ? [12, 13] : [-3, 7];
const MESSAGE_BOX_XY = IS_DESKTOP ? [3, 8] : [1, 8];
const MESSAGE_BOX_WIDTH = IS_DESKTOP ? 13 : 10;
const MESSAGE_BOX_HEIGHT = 5;
const MESSAGE_TEXT_XY = IS_DESKTOP ? [9.5, 10] : [6.5, 10];

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
let updateInterval = 0;
let rotationIndex = 0;
let nextTetrominos = [];
let nextTetromino = 0;
let touchMoveX = 0;
let touchMoveY = 0;
let touchPoint = 0;

function gameloop() {
  console.log("state=" + gameState);

  switch (gameState) {
    case GAME_INIT: // initialize the game and go to state READY
      gameInit();
      break;
    case GAME_READY: // print "ready" and wait for keypressed
      draw();
      drawIsReadyMessage("Get Ready!");
      break;
    case GAME_IS_RUNNING: // run the game until it is over
      draw();
      break;
    case GAME_IS_OVER: // print "game is over" and wait for keypressed and go to INIT
      draw();
      drawGameOverMessage("Game Over!");
      break;
  }
}

window.addEventListener("keydown", (event) => {
  let code = event.keyCode;
  let key = event.key;

  const keyPressedLeft = code == 37; // LEFT
  const keyPressedRight = code == 39; // RIGHT
  const keyPressedUp = code == 38; // UP
  const keyPressedDown = code == 40; // DOWN
  const keyPressedSpace = code == 32; // SPACE
  const keyPressedEsc = code == 27; // ESC
  const keyPressedP = key == "p" || key == "P";
  const keyPressedA = key == "a" || key == "A";
  const keyPressedD = key == "d" || key == "D";

  setTimeout(() => {
    switch (gameState) {
      case GAME_READY:
        if (keyPressedSpace) {
          gameState = GAME_IS_RUNNING;
        }
        break;
      case GAME_IS_RUNNING:
        if (keyPressedLeft || keyPressedA) {
          moveLeftTetromino();
        } else if (keyPressedRight || keyPressedD) {
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

canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  touchMoveX = event.touches[0].screenX;
  touchMoveY = event.touches[0].screenY;
});

canvas.addEventListener("touchend", (event) => {
  event.preventDefault();
  const touches = event.changedTouches;
  if (touches.length > 0) {
    const dx = touches[0].screenX - touchMoveX;
    const dy = touches[0].screenY - touchMoveY;
    if (dx < 5 && dy < 5) {
      touchPoint++;
    }
    const touchLeft = Math.abs(dx) > Math.abs(dy) && dx < 0;
    const touchRight = Math.abs(dx) > Math.abs(dy) && dx > 0;
    const touchUp = Math.abs(dx) < Math.abs(dy) && dy < 0;
    const touchDown = Math.abs(dx) < Math.abs(dy) && dy > 0;
    const doubleTouch = touchPoint >= 2;

    switch (gameState) {
      case GAME_READY:
        if (doubleTouch) {
          gameState = GAME_IS_RUNNING;
          touchPoint = 0;
        }
        break;
      case GAME_IS_RUNNING:
        if (touchLeft) {
          moveLeftTetromino();
        } else if (touchRight) {
          moveRightTetromino();
        } else if (touchUp) {
          rotateClockwise();
        } else if (touchDown) {
          hardDropTetromino();
        }
        break;
      case GAME_IS_OVER:
        if (doubleTouch) {
          gameState = GAME_INIT;
          touchPoint = 0;
        }
        break;
    }
  }
});

function setSpeed(speed) {
  if (updateInterval != 0) {
    clearInterval(updateInterval);
  }
  updateInterval = setInterval(() => update(), speed);
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
  //drawFillRect(0, 0, canvas.width, canvas.height, "yellow");
  IS_DESKTOP ? drawInfoBoardDesktop() : drawInfoBoardPhone();

  drawScore();
  drawLevel();
  if (IS_DESKTOP) drawLines();
  drawGameBoard();
  drawTetromino(0, 0, currentTetromino, currentCoords());
  drawTetromino(
    NEXT_TETROMINO_ROW_COL[0],
    NEXT_TETROMINO_ROW_COL[1],
    nextTetromino,
    TETROMINOS[nextTetromino - 1].coords[0],
  );

  drawTitle();
}

function drawTitle() {
  ctx.drawImage(
    title,
    TETRIS_IMAGE_XY[0] * CELL_WIDTH,
    TETRIS_IMAGE_XY[1] * CELL_WIDTH,
    TETRIS_IMAGE_WIDTH * CELL_WIDTH,
    TETRIS_IMAGE_HEIGHT * CELL_WIDTH,
  );
  drawText(
    TOM_TEXT_XY[0] * CELL_WIDTH,
    TOM_TEXT_XY[1] * CELL_WIDTH,
    "Tom's",
    "yellow",
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function drawInfoBoardDesktop() {
  for (let row = -1; row < BOARD_VISIBLE_ROWS + 1; row++) {
    for (let col = -1; col <= 19; col++) {
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

  drawFillRect(
    CELL_WIDTH * 12,
    CELL_WIDTH * 4,
    CELL_WIDTH * 6,
    CELL_WIDTH * 7,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );

  drawText(
    CELL_WIDTH * 15,
    CELL_WIDTH * 5,
    "NEXT",
    BOARD_BACKGROUND_COLOR_DARK,
    "center",
    "middle",
  );
  drawFillRect(
    CELL_WIDTH * 12,
    CELL_WIDTH * 12,
    CELL_WIDTH * 6,
    CELL_WIDTH * 9,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
}

function drawInfoBoardPhone() {
  for (let row = -5; row <= BOARD_VISIBLE_ROWS + 1; row++) {
    for (let col = -1; col <= 10; col++) {
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

  drawFillRect(
    CELL_WIDTH * 1,
    CELL_WIDTH * 23,
    CELL_WIDTH * 10,
    CELL_WIDTH * 2,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
}

function drawScore() {
  drawText(
    SCORE_TEXT_XY[0] * CELL_WIDTH,
    SCORE_TEXT_XY[1] * CELL_WIDTH,
    "SCORE",
    TEXT_COLOR_LIGHT,
    SCORE_TEXT_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    SCORE_VALUE_XY[0] * CELL_WIDTH,
    SCORE_VALUE_XY[1] * CELL_WIDTH,
    gameScore.toString(),
    BOARD_BACKGROUND_COLOR_DARK,
    SCORE_VALUE_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function drawLevel() {
  drawText(
    LEVEL_TEXT_XY[0] * CELL_WIDTH,
    LEVEL_TEXT_XY[1] * CELL_WIDTH,
    "LEVEL",
    TEXT_COLOR_LIGHT,
    LEVEL_TEXT_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    LEVEL_VALUE_XY[0] * CELL_WIDTH,
    LEVEL_VALUE_XY[1] * CELL_WIDTH,
    (gameLevel + 1).toString(),
    BOARD_BACKGROUND_COLOR_DARK,
    LEVEL_VALUE_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function drawLines() {
  drawText(
    LINES_TEXT_XY[0] * CELL_WIDTH,
    LINES_TEXT_XY[1] * CELL_WIDTH,
    "LINES",
    TEXT_COLOR_LIGHT,
    LINES_TEXT_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    LINES_VALUE_XY[0] * CELL_WIDTH,
    LINES_VALUE_XY[1] * CELL_WIDTH,
    gameLines.toString(),
    BOARD_BACKGROUND_COLOR_DARK,
    LINES_VALUE_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function drawGameBoard() {
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
  if (check && y < 0 + BOARD_OFFSET_Y) return;
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

function drawIsReadyMessage() {
  drawFillRect(
    CELL_WIDTH * MESSAGE_BOX_XY[0],
    CELL_WIDTH * MESSAGE_BOX_XY[1],
    CELL_WIDTH * MESSAGE_BOX_WIDTH,
    CELL_WIDTH * (MESSAGE_BOX_HEIGHT + 1),
    BOARD_BACKGROUND_COLOR_DARK,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY[0],
    CELL_WIDTH * (MESSAGE_TEXT_XY[1] - 1),
    "Get Ready!",
    BOARD_BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY[0],
    CELL_WIDTH * MESSAGE_TEXT_XY[1],
    IS_DESKTOP ? "press any key!" : "double touch the screen!  ",
    BOARD_BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
  let textlines = [
    IS_DESKTOP
      ? "Move tiles with cursor keys  "
      : "Move tiles with swipe gestures  ",
    "left, right: move horizontal  ",
    "up: turn tile  ",
    "down: drop down tile  ",
  ];
  let offset = 1.5;
  for (let index = 0; index < textlines.length; index++) {
    drawText(
      CELL_WIDTH * MESSAGE_TEXT_XY[0],
      CELL_WIDTH * (MESSAGE_TEXT_XY[1] + offset),
      textlines[index],
      BOARD_BACKGROUND_COLOR_LIGHT,
      "center",
      "middle",
      TEXT_FONT_SMALL,
    );
    offset += 0.6;
  }
}

function drawGameOverMessage() {
  drawFillRect(
    CELL_WIDTH * MESSAGE_BOX_XY[0],
    CELL_WIDTH * MESSAGE_BOX_XY[1],
    CELL_WIDTH * MESSAGE_BOX_WIDTH,
    CELL_WIDTH * MESSAGE_BOX_HEIGHT,
    BOARD_BACKGROUND_COLOR_DARK,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY[0],
    CELL_WIDTH * MESSAGE_TEXT_XY[1],
    "Game Over!",
    BOARD_BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY[0],
    CELL_WIDTH * (MESSAGE_TEXT_XY[1] + 1),
    IS_DESKTOP ? "press any key!" : "double touch the screen! ",
    BOARD_BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function transformRowToX(row) {
  return BOARD_VISIBLE_ROWS - row - 1 + BOARD_OFFSET_Y;
}

function transformColToX(col) {
  return col;
}
