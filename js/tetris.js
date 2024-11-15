"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fps = 60;

// colors
const BOARD_BACKGROUND_COLOR_DARK = "#333300";
const BOARD_BACKGROUND_COLOR_LIGHT = "#E5E5CC";
const BOARD_TEXT_COLOR_DARK = "#4C4C4C";
const BOARD_TEXT_COLOR_LIGHT = "#808080";
const BOARD_TEXT_COLOR_TERIS = "#FF00FF";

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

// tetrominos
const TETROMINO_I = 1;
const TETROMINO_J = 2;
const TETROMINO_L = 3;
const TETROMINO_O = 4;
const TETROMINO_S = 5;
const TETROMINO_T = 6;
const TETROMINO_Z = 7;

const TETROMINOS = [
  {
    // TETROMINO_I
    coords: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    // lightblue
    colorNormal: "#80C0FF",
    colorLight: "#C0E0FF",
    colorDark: "#3399FF",
  },
  {
    // TETROMINO_J
    coords: [
      [1, 0],
      [1, 1],
      [0, 2],
      [1, 2],
    ],
    // darkblue
    colorNormal: "#004C99",
    colorLight: "#0066CC",
    colorDark: "#003366",
  },
  {
    // TETROMINO_L
    coords: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
    // orange
    colorNormal: "#FFC080",
    colorLight: "#FFE0C0",
    colorDark: "#FFA040",
  },
  {
    // TETROMINO_O
    coords: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    // yellow
    colorNormal: "#CCCC00",
    colorLight: "#FFFF80",
    colorDark: "#C0C000",
  },
  {
    // TETROMINO_S
    coords: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ],
    // green
    colorNormal: "#80FF80",
    colorLight: "#C0FFC0",
    colorDark: "#00FF00",
  },
  {
    // TETROMINO_T
    coords: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    // magenta
    colorNormal: "#C080FF",
    colorLight: "#E0C0FF",
    colorDark: "#A040FF",
  },
  {
    // TETROMINO_Z
    coords: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    // red
    colorNormal: "#990000",
    colorLight: "#CC0000",
    colorDark: "#660000",
  },
];

// game variables
let gameInterval = setInterval(gameloop, 1000 / fps);
let board = Array(BOARD_ROWS)
  .fill()
  .map(() => Array(BOARD_COLS).fill(0));
let gameState = GAME_INIT;
let gameScore = 0;
let gameLevel = 0;
let gameLines = 0;
let fallSpeed = 0;
let currentTetromino = TETROMINO_I;
let currentTetrominoCoords = Array(4);

gameloop();

function gameloop() {
  switch (gameState) {
    case GAME_INIT: // initialize the game and go to state READY
      gameInit();
      break;
    case GAME_READY: // print "ready" and wait for keypressed
      draw();
      break;
    case GAME_IS_RUNNING: // run the game until it is over
      update();
      draw();
      break;
    case GAME_IS_OVER: // print "game is over" and wait for keypressed and go to INIT
      gameOver();
      draw();
      break;
  }
  console.log("state=" + gameState);
}

window.addEventListener("keydown", (event) => {
  let k = event.keyCode;

  const keyPressedLeft = k == 37 || k == 65; // LEFT || A
  const keyPressedRight = k == 39 || k == 68; // RIGHT || D
  const keyPressedUp = k == 38 || k == 76; // UP || L
  const keyPressedDown = k == 40 || k == 77; // DOWN || M
  const keyPressedSpace = k == 32; // SPACE
  const keyPressedEsc = k == 27; // ESC

  setTimeout(() => {
    switch (gameState) {
      case GAME_READY:
        if (keyPressedSpace) {
          gameState = GAME_IS_RUNNING;
        }
        break;
      case GAME_IS_RUNNING:
        if (keyPressedLeft) {
          moveTetrominoLeft();
        } else if (keyPressedRight) {
          moveTetrominoRight();
        } else if (keyPressedUp) {
          moveTetrominoUp();
        } else if (keyPressedDown) {
          moveTetrominoDown();
        } else if (keyPressedSpace) {
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

function nextTetromino() {
  currentTetromino = getRandomInt(TETROMINOS.length) + 1;
  console.info("next Tetromino: " + currentTetromino);
  for (let index = 0; index < 4; index++) {
    currentTetrominoCoords[index] =
      TETROMINOS[currentTetromino - 1].coords[index].slice();
  }
  let shift = currentTetromino == TETROMINO_O ? 4 : 3;
  currentTetrominoCoords.forEach((coord) => {
    coord[0] = coord[0] + (BOARD_ROWS - 2);
    coord[1] = coord[1] + shift;
  });
}

function gameInit() {
  board.forEach((row) => row.fill(0));
  nextTetromino();
  fallSpeed = 1;
  // Test
  board[1][5] = TETROMINO_S;
  board[1][6] = TETROMINO_S;
  board[0][4] = TETROMINO_S;
  board[0][5] = TETROMINO_S;
  gameState = GAME_READY;
}

function gameOver() {}

function update() {
  fallSpeed++;
  if (fallSpeed > 25) {
    moveTetrominoDown();
    if (isBottom()) {
      for (let index = 0; index < currentTetrominoCoords.length; index++) {
        let [row, col] = currentTetrominoCoords[index];
        board[row][col] = currentTetromino;
      }
      nextTetromino();
    }
    fallSpeed = 1;
  }
}

function draw() {
  drawFillRect(0, 0, canvas.width, canvas.height, BOARD_BACKGROUND_COLOR_DARK);

  drawInfoBoard();
  drawGameBoard();
  drawTetromino();
}

function drawInfoBoard() {
  let gameBoardWidth = CELL_WIDTH * (BOARD_COLS + 2);
  let infoBoardWidth = canvas.width - gameBoardWidth - CELL_WIDTH;
  let infoBoardCenter = gameBoardWidth + infoBoardWidth / 2;

  drawText(
    infoBoardCenter,
    CELL_WIDTH * 2,
    "TETRIS",
    BOARD_TEXT_COLOR_TERIS,
    "center",
    "middle",
    "40px",
  );

  drawFillRect(
    gameBoardWidth,
    CELL_WIDTH * 3,
    infoBoardWidth,
    CELL_WIDTH * 7,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
  drawText(
    infoBoardCenter,
    CELL_WIDTH * 4,
    "NEXT",
    BOARD_BACKGROUND_COLOR_DARK,
    "center",
    "middle",
  );
  drawFillRect(
    gameBoardWidth,
    CELL_WIDTH * 11,
    infoBoardWidth,
    CELL_WIDTH * 10,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
  drawText(
    infoBoardCenter,
    CELL_WIDTH * 12,
    "SCORE",
    BOARD_TEXT_COLOR_LIGHT,
    "center",
    "middle",
  );
  drawText(
    infoBoardCenter,
    CELL_WIDTH * 15,
    "LEVEL",
    BOARD_TEXT_COLOR_LIGHT,
    "center",
    "middle",
  );
  drawText(
    infoBoardCenter,
    CELL_WIDTH * 18,
    "LINES",
    BOARD_TEXT_COLOR_LIGHT,
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

function drawTetromino() {
  for (let index = 0; index < currentTetrominoCoords.length; index++) {
    let [row, col] = currentTetrominoCoords[index];
    drawCell(
      row,
      col,
      TETROMINOS[currentTetromino - 1].colorNormal,
      TETROMINOS[currentTetromino - 1].colorLight,
      TETROMINOS[currentTetromino - 1].colorDark,
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

function drawCell(row, col, colorNormal, colorLight, colorDark) {
  let x = transformColToX(col);
  let y = transformRowToX(row);
  if (y < 0) return;
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

function moveTetrominoLeft() {
  if (
    currentTetrominoCoords.every(
      (coord) => coord[1] > 0 && board[coord[0]][coord[1] - 1] == 0,
    )
  ) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][1]--;
    }
  }
}

function moveTetrominoRight() {
  if (
    currentTetrominoCoords.every(
      (coord) =>
        coord[1] < BOARD_COLS - 1 && board[coord[0]][coord[1] + 1] == 0,
    )
  ) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][1]++;
    }
  }
}

function isBottom() {
  return currentTetrominoCoords.some(
    (coord) => coord[0] == 0 || board[coord[0] - 1][coord[1]] > 0,
  );
}

function moveTetrominoDown() {
  if (!isBottom()) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][0]--;
    }
  }
}

function moveTetrominoUp() {
  if (
    currentTetrominoCoords.every((coord) => coord[0] < BOARD_VISIBLE_ROWS - 1)
  ) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][0]++;
    }
  }
}

function transformRowToX(row) {
  return BOARD_VISIBLE_ROWS - row - 1;
}

function transformColToX(col) {
  return col;
}
