const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");

const colors = {
  orange: "rgb(255,165,0)",
  white: "#fff",
  black: "#000",
  red: "rgb(255,0,0)",
};

let player = { x: 50, y: 400, w: 45, h: 45, speed: 4 };
let walls = [];
let endBlock = { x: 500, y: 450, w: 50, h: 50 };

let startTime, completeTime = null, bestTime = null;
let won = false;

function initWalls() {
  walls = [
    { x: 0, y: 0, w: 50, h: 800 },
    { x: 50, y: 0, w: 750, h: 50 },
    { x: 50, y: 450, w: 50, h: 50 },
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
}
initWalls();

let keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

restartBtn.addEventListener("click", () => {
  player.x = 50; player.y = 400;
  won = false; completeTime = null;
  startTime = performance.now();
  restartBtn.style.display = "none";
  loop();
});

function rectCollide(a, b) {
  return !(a.x + a.w < b.x || a.x > b.x + b.w ||
           a.y + a.h < b.y || a.y > b.y + b.h);
}

function draw() {
  ctx.clearRect(0, 0, 600, 500);
  ctx.strokeStyle = "rgb(100,100,100)";
  for (let x = 0; x <= 600; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,500); ctx.stroke(); }
  for (let y = 0; y <= 500; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(600,y); ctx.stroke(); }

  walls.forEach(w => { ctx.fillStyle = colors.orange; ctx.fillRect(w.x, w.y, w.w, w.h); });
  ctx.fillStyle = colors.white;
  ctx.fillRect(50,450,50,50);
  ctx.fillRect(endBlock.x, endBlock.y, endBlock.w, endBlock.h);

  ctx.fillStyle = colors.red;
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = colors.black;
  if (won) {
    ctx.font = "50px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("You Win!", 300, 180);
    ctx.font = "30px sans-serif";
    ctx.fillText(`You took ${(completeTime/1000).toFixed(2)}s`, 300, 230);
    ctx.fillText(`Best time: ${(bestTime/1000).toFixed(2)}s`, 300, 270);
  }
}

function update() {
  if (won) return;

  let prev = { x: player.x, y: player.y };

  if (keys["ArrowLeft"])  player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["ArrowUp"])    player.y -= player.speed;
  if (keys["ArrowDown"])  player.y += player.speed;

  walls.concat({},{...endBlock}).forEach(w => {
    if (rectCollide(player, w)) {
      if (w === endBlock) {
        won = true;
        completeTime = performance.now() - startTime;
        if (bestTime == null || completeTime < bestTime) bestTime = completeTime;
        restartBtn.style.display = "block";
      }
      player.x = prev.x;
      player.y = prev.y;
    }
  });

  player.x = Math.max(0, Math.min(player.x, 600 - player.w));
  player.y = Math.max(0, Math.min(player.y, 500 - player.h));
}

function loop() {
  update();
  draw();
  if (!won) requestAnimationFrame(loop);
}

startTime = performance.now();
loop();
