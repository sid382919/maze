const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 500;

const colors = {
  black: "#000000",
  white: "#FFFFFF",
  orange: "#FFA500",
  red: "#FF0000",
};

const playerSpeed = 4;
const gridSize = 50;

let state = "start"; // start, playing, won

// Player rect (x, y, w, h)
let player = { x: 50, y: 400, w: 45, h: 45 };

// Maze walls
const walls = [
  { x: 0, y: 0, w: 50, h: 800 },
  { x: 50, y: 0, w: 750, h: 50 },
  { x: 100, y: 400, w: 50, h: 150 },
  { x: 100, y: 300, w: 150, h: 50 },
  { x: 150, y: 450, w: 350, h: 50 },
  { x: 550, y: 50, w: 50, h: 450 },
  { x: 100, y: 100, w: 50, h: 145 },
  { x: 200, y: 100, w: 150, h: 50 },
  { x: 200, y: 200, w: 50, h: 150 },
  { x: 300, y: 150, w: 50, h: 150 },
  { x: 100, y: 50, w: 50, h: 50 },
  { x: 200, y: 350, w: 50, h: 50 },
  { x: 300, y: 300, w: 50, h: 150 },
  { x: 400, y: 100, w: 50, h: 150 },
  { x: 350, y: 200, w: 50, h: 50 },
  { x: 450, y: 100, w: 50, h: 50 },
  { x: 500, y: 200, w: 50, h: 50 },
  { x: 400, y: 300, w: 100, h: 50 },
  { x: 400, y: 350, w: 150, h: 50 },
];

// Start and end blocks
const startRect = { x: 50, y: 450, w: 50, h: 50 };
const endRect = { x: 500, y: 450, w: 50, h: 50 };

let keys = {};
let startTime = null;
let completeTime = 0;
let bestTime = null;

// Event listeners
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (state === "start") {
    state = "playing";
    startTime = performance.now();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function rectsCollide(r1, r2) {
  return !(
    r1.x + r1.w <= r2.x ||
    r1.x >= r2.x + r2.w ||
    r1.y + r1.h <= r2.y ||
    r1.y >= r2.y + r2.h
  );
}

function drawRect(rect, color) {
  ctx.fillStyle = color;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

function drawText(text, x, y, fontSize = "20px", color = colors.black) {
  ctx.fillStyle = color;
  ctx.font = `${fontSize} Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

function drawGrid() {
  ctx.strokeStyle = "#646464";
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function resetGame() {
  player.x = 50;
  player.y = 400;
  state = "start";
  completeTime = 0;
  startTime = null;
}

canvas.addEventListener("click", (e) => {
  if (state === "won") {
    // Calculate mouse pos relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if click inside restart button
    if (
      mouseX >= canvas.width / 2 - 70 &&
      mouseX <= canvas.width / 2 + 70 &&
      mouseY >= 350 &&
      mouseY <= 390
    ) {
      resetGame();
    }
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === "start") {
    ctx.fillStyle = colors.white;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawText("Press any key to start", canvas.width / 2, 200, "36px", colors.black);
    drawText("Use arrow keys to move", canvas.width / 2, 260, "28px", colors.black);
  } else if (state === "playing") {
    ctx.fillStyle = colors.black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    for (const wall of walls) {
      drawRect(wall, colors.orange);
    }

    drawRect(startRect, colors.white);
    drawRect(endRect, colors.white);

    drawText("Start", startRect.x + startRect.w / 2, startRect.y + startRect.h / 2 + 8, "20px", colors.black);
    drawText("End", endRect.x + endRect.w / 2, endRect.y + endRect.h / 2 + 8, "20px", colors.black);

    // Move player
    let previousPos = { ...player };

    if (keys["ArrowLeft"]) player.x -= playerSpeed;
    if (keys["ArrowRight"]) player.x += playerSpeed;
    if (keys["ArrowUp"]) player.y -= playerSpeed;
    if (keys["ArrowDown"]) player.y += playerSpeed;

    // Keep player inside canvas bounds
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.w));
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.h));

    // Check collisions
    for (const wall of walls) {
      if (rectsCollide(player, wall)) {
        player = previousPos; // revert to previous position on collision
        break;
      }
    }

    // Check if player reached end
    if (rectsCollide(player, endRect)) {
      state = "won";
      completeTime = (performance.now() - startTime) / 1000;
      if (bestTime === null || completeTime < bestTime) {
        bestTime = completeTime;
      }
    }

    drawRect(player, colors.red);
    drawText("You", player.x + player.w / 2, player.y + player.h / 2 + 8, "20px", colors.black);
  } else if (state === "won") {
    ctx.fillStyle = colors.white;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawText("You Win!", canvas.width / 2, 200, "50px", colors.black);
    drawText(`You took: ${completeTime.toFixed(2)} seconds`, canvas.width / 2, 260, "28px", colors.black);

    if (bestTime !== null) {
      drawText(`Best time: ${bestTime.toFixed(2)} seconds`, canvas.width / 2, 310, "28px", colors.black);
    }

    // Draw restart button
    ctx.fillStyle = colors.orange;
    ctx.fillRect(canvas.width / 2 - 70, 350, 140, 40);
    drawText("Restart", canvas.width / 2, 380, "28px", colors.black);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
