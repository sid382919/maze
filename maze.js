const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const bgMusic = document.getElementById("bgMusic");

const colors = {
  orange: "rgb(255,165,0)",
  white: "white",
  black: "black",
  red: "rgb(255,0,0)",
  grid: "rgb(100,100,100)",
};

let state = "start"; // "start", "playing", "won"

const player = {
  x: 75,
  y: 425,
  w: 45,
  h: 45,
  speed: 4,
};

const keys = {};

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

const startRect = { x: 50, y: 450, w: 50, h: 50 };
const endRect = { x: 500, y: 450, w: 50, h: 50 };

const GRID_SIZE = 50;

let startTime;
let completeTime = null;
let bestTime = null;

function drawGrid() {
  ctx.strokeStyle = colors.grid;
  for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

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

function drawText(text, x, y, size = "30px", color = colors.black, align = "center") {
  ctx.fillStyle = color;
  ctx.font = `${size} Arial`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function resetGame() {
  player.x = 75;
  player.y = 425;
  completeTime = null;
  startTime = new Date();
  state = "playing";
  restartBtn.style.display = "none";
  bgMusic.play();
  canvas.focus();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === "start") {
    ctx.fillStyle = colors.white;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawText("Press any key to start", canvas.width / 2, 200, "36px", colors.black);
    drawText("Use arrow keys to move", canvas.width / 2, 260, "28px", colors.black);
  } else if (state === "playing") {
    // move player
    let prevX = player.x;
    let prevY = player.y;

    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;

    // collision with walls
    for (const wall of walls) {
      if (
        rectsCollide(
          { x: player.x, y: player.y, w: player.w, h: player.h },
          wall
        )
      ) {
        player.x = prevX;
        player.y = prevY;
        break;
      }
    }

    // constrain player to canvas
    player.x = Math.min(Math.max(0, player.x), canvas.width - player.w);
    player.y = Math.min(Math.max(0, player.y), canvas.height - player.h);

    // draw grid
    drawGrid();

    // draw walls
    for (const wall of walls) {
      drawRect(wall, colors.orange);
    }

    // draw start and end blocks
    drawRect(startRect, colors.white);
    drawRect(endRect, colors.white);

    drawText("Start", startRect.x + startRect.w / 2, startRect.y + startRect.h / 2 + 8, "20px", colors.black);
    drawText("End", endRect.x + endRect.w / 2, endRect.y + endRect.h / 2 + 8, "20px", colors.black);

    // draw player as rectangle
    drawRect(player, colors.red);
    drawText("You", player.x + player.w / 2, player.y + player.h / 2 + 8, "20px", colors.black);

    // check win
    if (
      rectsCollide(player, endRect)
    ) {
      state = "won";
      completeTime = (new Date() - startTime) / 1000;
      if (bestTime === null || completeTime < bestTime) bestTime = completeTime;
      restartBtn.style.display = "inline-block";
      bgMusic.pause();
    }
  } else if (state === "won") {
    ctx.fillStyle = colors.white;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawText("You Win!", canvas.width / 2, 200, "50px", colors.black);
    drawText(
      `You took: ${completeTime.toFixed(2)} seconds`,
      canvas.width / 2,
      260,
      "28px",
      colors.black
    );
    if (bestTime !== null) {
      drawText(
        `Best time: ${bestTime.toFixed(2)} seconds`,
        canvas.width / 2,
        310,
        "28px",
        colors.black
      );
    }
  }

  requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener("keydown", (e) => {
  if (state === "start") {
    resetGame();
  }
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

// Start background music muted until user interaction due to browser policies
canvas.addEventListener("click", () => {
  if(bgMusic.paused) {
    bgMusic.play();
  }
});

resetGame();
gameLoop();
