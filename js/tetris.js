"use strict";

// * * * * * * * * * * * * *  C O N S T A N T S  * * * * * * * * * * * * *

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const title = document.getElementById("title");
const fps = 60;

// colors
const BACKGROUND_COLOR_DARK = "#333300";
const BACKGROUND_COLOR_LIGHT = "#E5E5CC";
const TEXT_COLOR_NORMAL = "#4C4C4C";
const TEXT_COLOR_DARK = "#202020";
const TEXT_COLOR_LIGHT = "#808080";

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

const CELL_WIDTH = IS_DESKTOP ? canvas.height / 22 : canvas.height / 26;
canvas.width = IS_DESKTOP ? 19 * CELL_WIDTH : 12 * CELL_WIDTH;

// prints
const BOARD_ZERO = IS_DESKTOP ? { x: 1, y: 20 } : { x: 1, y: 21 };
const FRAME_SIZE = IS_DESKTOP
  ? { width: 19, height: 22 }
  : { width: 12, height: 26 };
const FRAME_GAME = IS_DESKTOP
  ? {
      x: 1,
      y: 1,
      width: BOARD_COLS,
      height: BOARD_VISIBLE_ROWS,
    }
  : {
      x: 1,
      y: 2,
      width: BOARD_COLS,
      height: BOARD_VISIBLE_ROWS,
    };
const FRAME_NEXT = IS_DESKTOP
  ? { x: 12, y: 4, width: 6, heigth: 7 }
  : { x: 7, y: 23, width: 4, heigth: 2 };
const FRAME_INFO = IS_DESKTOP
  ? { x: 12, y: 12, width: 6, height: 9 }
  : { x: 1, y: 23, width: 6, height: 2 };

const TEXT_FONT_NORMAL = IS_DESKTOP ? "25px" : "16px";
const TEXT_FONT_SMALL = IS_DESKTOP ? "16px" : "12px";
const SCORE_TEXT_XY = IS_DESKTOP ? { x: 15, y: 13 } : { x: 2.5, y: 23.5 };
const SCORE_TEXT_ALIGN = "center";
const SCORE_VALUE_XY = IS_DESKTOP ? { x: 15, y: 14 } : { x: 2.5, y: 24.5 };
const SCORE_VALUE_ALIGN = "center";
const LEVEL_TEXT_XY = IS_DESKTOP ? { x: 15, y: 16 } : { x: 5.5, y: 23.5 };
const LEVEL_TEXT_ALIGN = "center";
const LEVEL_VALUE_XY = IS_DESKTOP ? { x: 15, y: 17 } : { x: 5.5, y: 24.5 };
const LEVEL_VALUE_ALIGN = "center";
const LINES_TEXT_XY = [15, 19];
const LINES_TEXT_ALIGN = "center";
const LINES_VALUE_XY = [15, 20];
const LINES_VALUE_ALIGN = "center";
const TETRIS_IMAGE_XY = IS_DESKTOP
  ? { x: 12, y: 1, width: 6, height: 2.5 }
  : { x: 4, y: 0.7, width: 4, height: 2.0 };
const TOM_TEXT_XY = IS_DESKTOP ? { x: 15, y: 0.5 } : { x: 6, y: 0.4 };
const NEXT_TETROMINO_ROW_COL = IS_DESKTOP
  ? { row: 12, col: 13 }
  : { row: -3, col: 7 };
const FRAME_MESSAGE_BOX = IS_DESKTOP
  ? { x: 3, y: 8, width: 13, height: 6 }
  : { x: 1, y: 8, width: 10, height: 6 };
const MESSAGE_TEXT_XY = IS_DESKTOP ? { x: 9.5, y: 10 } : { x: 6.5, y: 10 };

// * * * * * * * * * * * * *  G A M E  * * * * * * * * * * * * *

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
    case GAME_IS_OVER: // print "game is over" and wait for keypressed and go to GAME_INIT
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

function softDropSpeed(level) {
  // determine the spent per row in milli seconds depending of the level
  // function from harddrop.com/wiki/Tetris_Worlds
  return Math.pow(0.8 - (level - 1) * 0.007, level - 1) * 1000;
}
function hardDropSpeed() {
  return 50; // milli seconds
}

function setSpeed(speed) {
  if (updateInterval != 0) {
    clearInterval(updateInterval);
  }
  updateInterval = setInterval(() => update(), speed);
}

function gameInit() {
  board.forEach((row) => row.fill(0));
  gameLevel = 0;
  setSpeed(softDropSpeed(gameLevel));
  gameState = GAME_READY;
  nextTetrominos = shuffle(ALL_TETROMINOS.slice());
  getNextTetromino();
}

// * * * * * * * * * * * * *  U P D A T E   G A M E  * * * * * * * * * * * * *

function update() {
  if (gameState != GAME_IS_RUNNING) return;
  if (isBottom()) {
    if (isGameOver()) {
      gameState = GAME_IS_OVER;
    } else {
      updateBoard();
      let lines = clearLines();
      gameLines += lines;
      gameScore += scoreOfClearLines(lines);
      getNextTetromino();
    }
    gameLevel = Math.round(gameLines / 10);
    if (gameLevel > 10) {
      gameLevel = 10;
    }
    setSpeed(softDropSpeed(gameLevel));
  }
  moveDownTetromino();
}

function updateBoard() {
  let coords = TETROMINOS[currentTetromino - 1].coords[rotationIndex];
  for (let index = 0; index < coords.length; index++) {
    let [row, col] = coords[index];
    board[row + currentOffset[0]][col + currentOffset[1]] = currentTetromino;
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

function getNextTetromino() {
  currentTetromino = nextTetrominos.pop();
  if (nextTetrominos.length == 0) {
    nextTetrominos = shuffle(ALL_TETROMINOS.slice());
  }
  nextTetromino = nextTetrominos.at(nextTetrominos.length - 1);
  // set the tetromino at the top of the board in invisible rows
  // and center of the board columns
  currentOffset = [BOARD_ROWS - 2, 4];
  rotationIndex = 0;
}

function currentCoords() {
  return TETROMINOS[currentTetromino - 1].coords[rotationIndex].map((coord) => [
    coord[0] + currentOffset[0],
    coord[1] + currentOffset[1],
  ]);
}

function moveIsValid() {
  return currentCoords().every(
    (coord) =>
      // all coords are inside of board
      coord[0] >= 0 &&
      coord[0] < BOARD_ROWS &&
      coord[1] >= 0 &&
      coord[1] < BOARD_COLS &&
      // all cells of board are free
      board[coord[0]][coord[1]] == 0,
  );
}

function hardDropTetromino() {
  setSpeed(hardDropSpeed());
}

function rotateClockwise() {
  let oldIndex = rotationIndex;
  rotationIndex = rotationIndex < 3 ? rotationIndex + 1 : 0;
  if (!moveIsValid()) {
    rotationIndex = oldIndex;
  }
}

function moveLeftTetromino() {
  currentOffset[1]--;
  if (!moveIsValid()) {
    currentOffset[1]++;
  }
}

function moveRightTetromino() {
  currentOffset[1]++;
  if (!moveIsValid()) {
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

// * * * * * * * * * * * * *  D R A W  G A M E  * * * * * * * * * * * * *

function draw() {
  drawFrame();
  drawNext();
  drawScore();
  drawLevel();
  if (IS_DESKTOP) drawLines();
  drawBoard();
  drawCurrentTetromino();
  drawTitle();
}

function drawTitle() {
  ctx.drawImage(
    title,
    TETRIS_IMAGE_XY.x * CELL_WIDTH,
    TETRIS_IMAGE_XY.y * CELL_WIDTH,
    TETRIS_IMAGE_XY.width * CELL_WIDTH,
    TETRIS_IMAGE_XY.height * CELL_WIDTH,
  );
  drawText(
    TOM_TEXT_XY.x * CELL_WIDTH,
    TOM_TEXT_XY.y * CELL_WIDTH,
    "Tom's",
    "yellow",
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function drawFrame() {
  for (let y = 0; y < FRAME_SIZE.height; y++) {
    for (let x = 0; x < FRAME_SIZE.width; x++) {
      drawCell(x, y, TEXT_COLOR_NORMAL, TEXT_COLOR_LIGHT, TEXT_COLOR_DARK);
    }
  }

  drawFillRect(
    CELL_WIDTH * FRAME_NEXT.x,
    CELL_WIDTH * FRAME_NEXT.y,
    CELL_WIDTH * FRAME_NEXT.width,
    CELL_WIDTH * FRAME_NEXT.heigth,
    BACKGROUND_COLOR_LIGHT,
  );

  drawFillRect(
    CELL_WIDTH * FRAME_INFO.x,
    CELL_WIDTH * FRAME_INFO.y,
    CELL_WIDTH * FRAME_INFO.width,
    CELL_WIDTH * FRAME_INFO.height,
    BACKGROUND_COLOR_LIGHT,
  );
}

function drawNext() {
  if (IS_DESKTOP) {
    drawText(
      CELL_WIDTH * 15,
      CELL_WIDTH * 5,
      "NEXT",
      BACKGROUND_COLOR_DARK,
      "center",
      "middle",
    );
  }
  drawNextTetromino();
}

function drawScore() {
  drawText(
    SCORE_TEXT_XY.x * CELL_WIDTH,
    SCORE_TEXT_XY.y * CELL_WIDTH,
    "SCORE",
    TEXT_COLOR_LIGHT,
    SCORE_TEXT_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    SCORE_VALUE_XY.x * CELL_WIDTH,
    SCORE_VALUE_XY.y * CELL_WIDTH,
    gameScore.toString(),
    BACKGROUND_COLOR_DARK,
    SCORE_VALUE_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function drawLevel() {
  drawText(
    LEVEL_TEXT_XY.x * CELL_WIDTH,
    LEVEL_TEXT_XY.y * CELL_WIDTH,
    "LEVEL",
    TEXT_COLOR_LIGHT,
    LEVEL_TEXT_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    LEVEL_VALUE_XY.x * CELL_WIDTH,
    LEVEL_VALUE_XY.y * CELL_WIDTH,
    (gameLevel + 1).toString(),
    BACKGROUND_COLOR_DARK,
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
    BACKGROUND_COLOR_DARK,
    LINES_VALUE_ALIGN,
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function drawBoard() {
  for (let row = 0; row < BOARD_VISIBLE_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (board[row][col] == 0) {
        drawEmptyCell(colToX(col), rowToY(row));
      } else {
        let tetromino = board[row][col];
        drawCell(
          colToX(col),
          rowToY(row),
          TETROMINOS[tetromino - 1].colorNormal,
          TETROMINOS[tetromino - 1].colorLight,
          TETROMINOS[tetromino - 1].colorDark,
        );
      }
    }
  }
}

function drawCurrentTetromino() {
  drawTetromino(currentTetromino, currentCoords(), 0, 0);
}

function drawNextTetromino() {
  drawTetromino(
    nextTetromino,
    TETROMINOS[nextTetromino - 1].coords[0],
    NEXT_TETROMINO_ROW_COL.row,
    NEXT_TETROMINO_ROW_COL.col,
  );
}

function drawTetromino(tetramino, coords, offsetRow, offsetCol) {
  for (let index = 0; index < coords.length; index++) {
    let [row, col] = coords[index];
    if (row < BOARD_VISIBLE_ROWS) {
      drawCell(
        colToX(col + offsetCol),
        rowToY(row + offsetRow),
        TETROMINOS[tetramino - 1].colorNormal,
        TETROMINOS[tetramino - 1].colorLight,
        TETROMINOS[tetramino - 1].colorDark,
      );
    }
  }
}

function drawEmptyCell(x, y) {
  drawFillRect(
    x * CELL_WIDTH,
    y * CELL_WIDTH,
    CELL_WIDTH,
    CELL_WIDTH,
    "#CCCCCC",
  );
  drawFillRect(
    x * CELL_WIDTH + 1,
    y * CELL_WIDTH + 1,
    CELL_WIDTH - 2,
    CELL_WIDTH - 2,
    BACKGROUND_COLOR_LIGHT,
  );
}

function drawCell(x, y, colorNormal, colorLight, colorDark) {
  drawFillRect(
    x * CELL_WIDTH,
    y * CELL_WIDTH,
    CELL_WIDTH - 0,
    CELL_WIDTH - 2,
    colorLight,
  );
  drawFillRect(
    x * CELL_WIDTH + 4,
    y * CELL_WIDTH + 4,
    CELL_WIDTH - 4,
    CELL_WIDTH - 4,
    colorDark,
  );
  drawFillRect(x * CELL_WIDTH + 0, (y + 1) * CELL_WIDTH - 4, 4, 4, colorLight);
  drawFillRect(
    x * CELL_WIDTH + 4,
    y * CELL_WIDTH + 4,
    CELL_WIDTH - 8,
    CELL_WIDTH - 8,
    colorNormal,
  );
}

function drawIsReadyMessage() {
  drawFillRect(
    CELL_WIDTH * FRAME_MESSAGE_BOX.x,
    CELL_WIDTH * FRAME_MESSAGE_BOX.y,
    CELL_WIDTH * FRAME_MESSAGE_BOX.width,
    CELL_WIDTH * FRAME_MESSAGE_BOX.height,
    BACKGROUND_COLOR_DARK,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY.x,
    CELL_WIDTH * (MESSAGE_TEXT_XY.y - 1),
    "Get Ready!",
    BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY.x,
    CELL_WIDTH * MESSAGE_TEXT_XY.y,
    IS_DESKTOP ? "press any key!" : "touch the screen!",
    BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
  let textlines = [
    IS_DESKTOP
      ? "Move tiles with cursor keys  "
      : "Move tiles by swiping screen  ",
    "left, right: move horizontal  ",
    "up: turn tile  ",
    "down: drop down tile  ",
  ];
  let offset = 1.5;
  for (let index = 0; index < textlines.length; index++) {
    drawText(
      CELL_WIDTH * MESSAGE_TEXT_XY.x,
      CELL_WIDTH * (MESSAGE_TEXT_XY.y + offset),
      textlines[index],
      BACKGROUND_COLOR_LIGHT,
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
    BACKGROUND_COLOR_DARK,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY[0],
    CELL_WIDTH * MESSAGE_TEXT_XY[1],
    "Game Over!",
    BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
  drawText(
    CELL_WIDTH * MESSAGE_TEXT_XY[0],
    CELL_WIDTH * (MESSAGE_TEXT_XY[1] + 1),
    IS_DESKTOP ? "press any key!" : "double touch the screen! ",
    BACKGROUND_COLOR_LIGHT,
    "center",
    "middle",
    TEXT_FONT_NORMAL,
  );
}

function rowToY(row) {
  return BOARD_ZERO.y - row;
}

function colToX(col) {
  return BOARD_ZERO.x + col;
}
