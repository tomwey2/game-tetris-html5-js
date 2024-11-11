"use strict";
function drawFillRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawText(
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
