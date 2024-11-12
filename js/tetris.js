"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fps = 60;

// Colors
const BOARD_BACKGROUND_COLOR_DARK = "#333300";
const BOARD_BACKGROUND_COLOR_LIGHT = "#E5E5CC";
const BOARD_TEXT_COLOR_DARK = "#4C4C4C";
const BOARD_TEXT_COLOR_LIGHT = "#808080";
const BOARD_TEXT_COLOR_TERIS = "#FF00FF";

// Game states
const GAME_INIT = "GAME_INIT";
const GAME_IS_RUNNING = "GAME_IS_RUNNING";
const GAME_IS_OVER = "GAME_IS_OVER";
const GAME_IS_PAUSED = "GAME_IS_PAUSED";

// Dimensions
const BOARD_ROWS = 20;
const BOARD_COLUMNS = 10;
const CELL_WIDTH = canvas.height / (BOARD_ROWS + 2);

// Tetrominos
const TETROMINO_I = 0;
const TETROMINO_J = 1;
const TETROMINO_L = 2;
const TETROMINO_O = 3;
const TETROMINO_S = 4;
const TETROMINO_T = 5;
const TETROMINO_Z = 6;

const TETROMINOS = [
  {
    // TETROMINO_I
    coords: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    colorNormal: "#80C0FF",
    colorLight: "#C0E0FF",
    colorDark: "#3399FF",
  },
  {
    // TETROMINO_J
    coords: [
      [0, 1],
      [1, 1],
      [2, 0],
      [2, 1],
    ],
    colorNormal: "#004C99",
    colorLight: "#0066CC",
    colorDark: "#003366",
  },
  {
    // TETROMINO_L
    coords: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    colorNormal: "#FFC080",
    colorLight: "#FFE0C0",
    colorDark: "#FFA040",
  },
  {
    // TETROMINO_O
    coords: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    colorNormal: "#FFFF80",
    colorLight: "#FFFFC0",
    colorDark: "#FFFF40",
  },
  {
    // TETROMINO_S
    coords: [
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ],
    colorNormal: "#80FFC0",
    colorLight: "#C0FFE0",
    colorDark: "#40FFA0",
  },
  {
    // TETROMINO_T
    coords: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 1],
    ],
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
    colorNormal: "#990000",
    colorLight: "#CC0000",
    colorDark: "#660000",
  },
];

// Game variables
let gameInterval = setInterval(gameloop, 1000 / fps);
let board;
let gameState = GAME_INIT;
let gameScore = 0;
let gameLevel = 0;
let gemeLines = 0;
let currentTetromino = TETROMINO_I;
let currentTetrominoCoords = [];

function setGameState(state) {
  gameState = state;
}

/*
state           event               action          next state
INIT            keypressed          board empty     RUNNING
RUNNING         line is on top                      OVER
OVER            keypressed                          INIT
*/
function gameloop() {
  switch (gameState) {
    case GAME_INIT:
      gameInit();
      draw();
      break;
    case GAME_IS_RUNNING:
      update();
      draw();
      break;
    case GAME_IS_OVER:
      gameOver();
      draw();
      break;
  }
  console.log("state=" + gameState);
}

gameloop();

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
      case GAME_INIT:
        if (keyPressedSpace) {
          setGameState(GAME_IS_RUNNING);
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
          setGameState(GAME_IS_PAUSED);
        } else if (keyPressedEsc) {
          setGameState(GAME_IS_OVER);
        }
        break;
      case GAME_IS_PAUSED:
        if (keyPressedSpace) {
          setGameState(GAME_IS_RUNNING);
        } else if (keyPressedEsc) {
          setGameState(GAME_IS_OVER);
        }
        break;
      case GAME_IS_OVER:
        if (keyPressedSpace) {
          setGameState(GAME_INIT);
        }
        break;
    }
  }, 1);
});

function gameInit() {
  board = Array(BOARD_ROWS)
    .fill()
    .map(() => Array(BOARD_COLUMNS).fill(0));
  currentTetromino = getRandomInt(TETROMINOS.length);
  currentTetrominoCoords = TETROMINOS[currentTetromino].coords.slice();
  // Test
  board[BOARD_ROWS - 2][5] = TETROMINO_S;
  board[BOARD_ROWS - 2][6] = TETROMINO_S;
  board[BOARD_ROWS - 1][4] = TETROMINO_S;
  board[BOARD_ROWS - 1][5] = TETROMINO_S;
}

function gameOver() {}

function update() {}

function draw() {
  drawFillRect(0, 0, canvas.width, canvas.height, BOARD_BACKGROUND_COLOR_DARK);

  drawInfoBoard();
  drawGameBoard();
  drawTetromino();
}

function drawInfoBoard() {
  let gameBoardWidth = CELL_WIDTH * (BOARD_COLUMNS + 2);
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
    CELL_WIDTH * BOARD_COLUMNS,
    CELL_WIDTH * BOARD_ROWS,
    BOARD_BACKGROUND_COLOR_LIGHT,
  );
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLUMNS; col++) {
      if (board[row][col] == 0) {
        drawFillRect(
          CELL_WIDTH + col * CELL_WIDTH,
          CELL_WIDTH + row * CELL_WIDTH,
          CELL_WIDTH,
          CELL_WIDTH,
          "#CCCCCC",
        );
        drawFillRect(
          CELL_WIDTH + col * CELL_WIDTH + 1,
          CELL_WIDTH + row * CELL_WIDTH + 1,
          CELL_WIDTH - 2,
          CELL_WIDTH - 2,
          BOARD_BACKGROUND_COLOR_LIGHT,
        );
      } else {
        let tetromino = board[row][col];
        drawCell(
          col,
          row,
          TETROMINOS[tetromino].colorNormal,
          TETROMINOS[tetromino].colorLight,
          TETROMINOS[tetromino].colorDark,
        );
      }
    }
  }
}

function drawTetromino() {
  for (let index = 0; index < currentTetrominoCoords.length; index++) {
    let [x, y] = currentTetrominoCoords[index];
    drawCell(
      x,
      y,
      TETROMINOS[currentTetromino].colorNormal,
      TETROMINOS[currentTetromino].colorLight,
      TETROMINOS[currentTetromino].colorDark,
    );
  }
}

function drawCell(x, y, colorNormal, colorLight, colorDark) {
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
      (coord) => coord[0] > 0 && board[coord[1]][coord[0] - 1] == 0,
    )
  ) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][0]--;
    }
  }
}

function moveTetrominoRight() {
  if (
    currentTetrominoCoords.every(
      (coord) =>
        coord[0] < BOARD_COLUMNS - 1 && board[coord[1]][coord[0] + 1] == 0,
    )
  ) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][0]++;
    }
  }
}

function moveTetrominoUp() {
  if (currentTetrominoCoords.every((coord) => coord[1] > 0)) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][1]--;
    }
  }
}

function moveTetrominoDown() {
  if (
    currentTetrominoCoords.every(
      (coord) =>
        coord[1] < BOARD_ROWS - 1 && board[coord[1] + 1][coord[0]] == 0,
    )
  ) {
    for (let index = 0; index < currentTetrominoCoords.length; index++) {
      currentTetrominoCoords[index][1]++;
    }
  }
}
