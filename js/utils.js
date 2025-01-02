"use strict";

function drawFillRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawFillText(
  px,
  py,
  text,
  color,
  textAlign = "start",
  textBaseline = "alphabetic",
  fontSize = "25px",
) {
  ctx.font = fontSize + " PressStart2P";
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillText(text, px, py);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
