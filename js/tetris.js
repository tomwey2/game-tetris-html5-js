"use strict";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fps = 60;
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
const BOARD_ROWS = 20;
const BOARD_COLUMNS = 10;
const CELL_WIDTH = canvas.height / (BOARD_ROWS + 2);
const TETROMINO_I = 0;
const TETROMINO_J = 1;
const TETROMINO_L = 2;
const TETROMINO_O = 3;
const TETROMINO_S = 4;
const TETROMINO_T = 5;
const TETROMINO_Z = 6;

const TETROMINOS = [
  [
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
];

let gameInterval = setInterval(mainloop, 1000 / fps);
let board;
let gameState = GAME_INIT;
let gameScore = 0;
let gameLevel = 0;
let gemeLines = 0;
let currentTetromino = TETROMINOS[TETROMINO_I];

function setGameState(state) {
  gameState = state;
}

/*
state           event               action          next state
INIT            keypressed          board empty     RUNNING
RUNNING         line is on top                      OVER
OVER            keypressed                          INIT
*/
function mainloop() {
  switch (gameState) {
    case GAME_INIT:
      gameInit();
      draw();
      break;
    case GAME_IS_RUNNING:
      gameLoop();
      break;
    case GAME_IS_OVER:
      gameOver();
      break;
  }
  console.log(" state=" + gameState);
}

mainloop();

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
          moveLeft();
        } else if (keyPressedRight) {
          moveRight();
        } else if (keyPressedUp) {
          moveUp();
        } else if (keyPressedDown) {
          moveDown();
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
}

function gameOver() {}

function gameLoop() {
  update();
  draw();
}

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
    }
  }
}

function drawTetromino() {
  for (let index = 0; index < currentTetromino.length; index++) {
    drawCell(
      currentTetromino[index][0],
      currentTetromino[index][1],
      "#C00000",
      "#FF0000",
      "#800000",
    );
  }
}

function drawCell(x, y, colorNormal, colorLight, colorDark) {
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH,
    CELL_WIDTH + y * CELL_WIDTH,
    CELL_WIDTH - 0,
    CELL_WIDTH - 2,
    colorDark,
  );
  drawFillRect(
    CELL_WIDTH + x * CELL_WIDTH + 4,
    CELL_WIDTH + y * CELL_WIDTH + 4,
    CELL_WIDTH - 4,
    CELL_WIDTH - 4,
    colorLight,
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

function moveLeft() {
  if (currentTetromino.every((coord) => coord[0] > 0)) {
    for (let index = 0; index < currentTetromino.length; index++) {
      currentTetromino[index][0]--;
    }
  }
}

function moveRight() {
  if (currentTetromino.every((coord) => coord[0] < BOARD_COLUMNS - 1)) {
    for (let index = 0; index < currentTetromino.length; index++) {
      currentTetromino[index][0]++;
    }
  }
}

function moveUp() {
  if (currentTetromino.every((coord) => coord[1] > 0)) {
    for (let index = 0; index < currentTetromino.length; index++) {
      currentTetromino[index][1]--;
    }
  }
}

function moveDown() {
  if (currentTetromino.every((coord) => coord[1] < BOARD_ROWS - 1)) {
    for (let index = 0; index < currentTetromino.length; index++) {
      currentTetromino[index][1]++;
    }
  }
}
