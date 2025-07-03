const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const restartBtn = document.getElementById("restartBtn");
const bgMusic = document.getElementById("bgMusic");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const ORANGE = "rgb(255,165,0)";
const WHITE = "white";
const BLACK = "black";
const PLAYER_COLOR = "red";
const GRID_COLOR = "rgb(100,100,100)";

const GRID_SIZE = 50;

let keys = {};
let state = "start"; // "start", "playing", "won"
let startTime = 0;
let completeTime = 0;
let bestTime = null;

const playerSpeed = 4;

const player = {
  x: 75,
  y: 425,
  width: 45,
  height: 45,
};

const walls = [
  { x: 0, y: 0, width: 50, height: 800 },
  { x: 50, y: 0, width: 750, height: 50 },
  { x: 50, y: 450, width: 50, height: 50 },
  { x: 100, y: 400, width: 50, height: 150 },
  { x: 100, y: 300, width: 150, height: 50 },
  { x: 150, y: 450, width: 350, height: 50 },
  { x: 550, y: 50, width: 50, height: 450 },
  { x: 100, y: 100, width: 50, height: 145 },
  { x: 200, y: 100, width: 150, height: 50 },
  { x: 200, y: 200, width: 50, height: 150 },
  { x: 300, y: 150, width: 50, height: 150 },
  { x: 100, y: 50, width: 50, height: 50 },
  { x: 200, y: 350, width: 50, height: 50 },
  { x: 300, y: 300, width: 50, height: 150 },
  { x: 400, y: 100, width: 50, height: 150 },
  { x: 350, y: 200, width: 50, height: 50 },
  { x: 450, y: 100, width: 50, height: 50 },
  { x: 500, y: 200, width: 50, height: 50 },
  { x: 400, y: 300, width: 100, height: 50 },
  { x: 400, y: 350, width: 150, height: 50 },
];

const startRect = { x: 50, y: 450, width: 50, height: 50 };
const endRect = { x: 500, y: 450, width: 50, height: 50 };

function rectsCollide(r1, r2) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

function drawGrid() {
  ctx.strokeStyle = GRID_COLOR;
  for (let x = 0; x <= WIDTH; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
}

function drawStartScreen() {
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = BLACK;
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Press any key to start", WIDTH / 2, HEIGHT / 2 - 20);
  ctx.font = "24px Arial";
  ctx.fillText("Use arrow keys to move", WIDTH / 2, HEIGHT / 2 + 20);
}

function drawMaze() {
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawGrid();

  walls.forEach((wall) => {
    ctx.fillStyle = ORANGE;
    ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
  });

  // Draw start and end blocks
  ctx.fillStyle = WHITE;
  ctx.fillRect(startRect.x, startRect.y, startRect.width, startRect.height);
  ctx.fillRect(endRect.x, endRect.y, endRect.width, endRect.height);

  // Texts
  ctx.fillStyle = BLACK;
  ctx.font = "20px Arial";
  ctx.textAlign = "center";

  ctx.fillText("Start", startRect.x + startRect.width / 2, startRect.y + startRect.height / 2 + 7);
  ctx.fillText("End", endRect.x + endRect.width / 2, endRect.y + endRect.height / 2 + 7);
}

function drawPlayer() {
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = BLACK;
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "You",
    player.x + player.width / 2,
    player.y + player.height / 2 + 6
  );
}

function drawWinScreen() {
  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = BLACK;
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillText("You Win!", WIDTH / 2, HEIGHT / 2 - 40);

  ctx.font = "28px Arial";
  ctx.fillText(
    `You took: ${(completeTime / 1000).toFixed(2)} seconds`,
    WIDTH / 2,
    HEIGHT / 2 + 10
  );

  if (bestTime !== null) {
    ctx.fillText(
      `Best time: ${(bestTime / 1000).toFixed(2)} seconds`,
      WIDTH / 2,
      HEIGHT / 2 + 50
    );
  }
}

// Movement and collision check
function movePlayer() {
  const prevPos = { x: player.x, y: player.y };

  if (keys["ArrowLeft"]) player.x -= playerSpeed;
  if (keys["ArrowRight"]) player.x += playerSpeed;
  if (keys["ArrowUp"]) player.y -= playerSpeed;
  if (keys["ArrowDown"]) player.y += playerSpeed;

  // Boundary check
  player.x = Math.max(0, Math.min(WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(HEIGHT - player.height, player.y));

  // Collision with walls
  for (const wall of walls) {
    if (rectsCollide(player, wall)) {
      player.x = prevPos.x;
      player.y = prevPos.y;
      break;
    }
  }

  // Collision with start block (don't let player move inside start)
  if (rectsCollide(player, startRect)) {
    player.x = prevPos.x;
    player.y = prevPos.y;
  }

  // Check if player reached end
  if (rectsCollide(player, endRect)) {
    state = "won";
    completeTime = performance.now() - startTime;
    if (bestTime === null || completeTime < bestTime) {
      bestTime = completeTime;
    }
    restartBtn.style.display = "inline-block";
  }
}

function resetGame() {
  player.x = 75;
  player.y = 425;
  keys = {};
  state = "start";
  completeTime = 0;
  restartBtn.style.display = "none";
  drawStartScreen();
}

function gameLoop() {
  if (state === "start") {
    drawStartScreen();
  } else if (state === "playing") {
    movePlayer();
    drawMaze();
    drawPlayer();
  } else if (state === "won") {
    drawWinScreen();
  }

  requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener("keydown", (e) => {
  if (state === "start") {
    state = "playing";
    startTime = performance.now();
    bgMusic.play().catch(() => {});
  }
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

// Start the game with the start screen drawn
drawStartScreen();
