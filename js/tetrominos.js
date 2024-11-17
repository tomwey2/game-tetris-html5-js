"use strict";
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
      [
        [0, -1],
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [2, 1],
        [1, 1],
        [0, 1],
        [-1, 1],
      ],
      [
        [1, -1],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [1, 0],
        [0, 0],
        [-1, 0],
      ],
    ],
    // lightblue
    colorNormal: "#80C0FF",
    colorLight: "#C0E0FF",
    colorDark: "#3399FF",
  },
  {
    // TETROMINO_J
    coords: [
      [
        [1, -1],
        [0, -1],
        [0, 0],
        [0, 1],
      ],
      [
        [-1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [0, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [1, 0],
        [0, 0],
      ],
    ],
    // darkblue
    colorNormal: "#004C99",
    colorLight: "#0066CC",
    colorDark: "#003366",
  },
  {
    // TETROMINO_L
    coords: [
      [
        [0, -1],
        [0, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
      ],
      [
        [1, 0],
        [0, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [1, 0],
        [0, 0],
        [0, 1],
      ],
    ],
    // orange
    colorNormal: "#FFC080",
    colorLight: "#FFE0C0",
    colorDark: "#FFA040",
  },
  {
    // TETROMINO_O
    coords: [
      [
        [1, 0],
        [0, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, 1],
      ],
      [
        [0, -1],
        [-1, -1],
        [-1, 0],
        [0, 0],
      ],
      [
        [1, -1],
        [0, -1],
        [0, 0],
        [1, 0],
      ],
    ],
    // yellow
    colorNormal: "#CCCC00",
    colorLight: "#FFFF80",
    colorDark: "#C0C000",
  },
  {
    // TETROMINO_S
    coords: [
      [
        [0, -1],
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      [
        [1, 0],
        [0, 0],
        [0, 1],
        [-1, 1],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    ],
    // green
    colorNormal: "#80FF80",
    colorLight: "#C0FFC0",
    colorDark: "#00FF00",
  },
  {
    // TETROMINO_T
    coords: [
      [
        [0, -1],
        [0, 0],
        [1, 0],
        [0, 1],
      ],
      [
        [0, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [1, 0],
        [1, 1],
        [0, 0],
      ],
    ],
    // magenta
    colorNormal: "#C080FF",
    colorLight: "#E0C0FF",
    colorDark: "#A040FF",
  },
  {
    // TETROMINO_Z
    coords: [
      [
        [1, -1],
        [1, 0],
        [0, 0],
        [0, 1],
      ],
      [
        [-1, 0],
        [0, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
    ],
    // red
    colorNormal: "#990000",
    colorLight: "#CC0000",
    colorDark: "#660000",
  },
];
