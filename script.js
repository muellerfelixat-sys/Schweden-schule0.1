const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let score = 0;
let funFact = "";
let factTimer = 0;
let factActive = false;

const swedenFacts = [
  "🇸🇪 Schweden hat 7x Eurovision gewonnen!",
  "🐻 300.000 Elche leben in Schweden",
  "🏅 39 Nobelpreisträger aus Schweden",
  "⚽ Vize-Weltmeister 1958",
  "👑 250.000 Jäger in Schweden"
];

const player = {
  x: 50, y: 300, width: 40, height: 40,
  color: "#005BAE", vx: 0, vy: 0,
  speed: 2, jumpPower: -12, onGround: false
};

const groundY = 350;
const coin = { x: 0, y: 0, width: 25, height: 25, collected: false, spawnTimer: 0 };

let platforms = [
  { x: 100, y: 280, width: 120, height: 20, vx: 1, rangeLeft: 80, rangeRight: 300 },
  { x: 400, y: 230, width: 120, height: 20, vx: -1, rangeLeft: 350, rangeRight: 650 },
  { x: 200, y: 180, width: 100, height: 20, vx: 1, rangeLeft: 150, rangeRight: 500 }
];

const keys = { left: false, right: false, up: false };

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "Space" || e.code === "ArrowUp") keys.up = true;
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "Space" || e.code === "ArrowUp") keys.up = false;
});

function showRandomFact() {
  funFact = swedenFacts[Math.floor(Math.random() * swedenFacts.length)];
  factActive = true;
  factTimer = 180;
}

function spawnCoin() {
  coin.x = Math.random() * (canvas.width - coin.width - 50) + 25;
  coin.y = Math.random() * 200 + 50;
  coin.collected = false;
  coin.spawnTimer = 0;
}

function shufflePlatforms() {
  platforms.forEach(p => {
    p.x = Math.random() * (canvas.width - p.width - 100) + 50;
    p.y = Math.random() * 200 + 100;
    p.rangeLeft = p.x - 50;
    p.rangeRight = p.x + 200;
    p.vx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
  });
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");
  gradient.addColorStop(0.5, "#4682B4");
  gradient.addColorStop(1, "#1E3A8A");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
  platforms.forEach(p => {
    p.x += p.vx;
    if (p.x < p.rangeLeft || p.x + p.width > p.rangeRight) p.vx *= -1;
  });

  if (coin.collected) {
    coin.spawnTimer++;
    if (coin.spawnTimer > 120) spawnCoin();
  }

  player.vx = 0;
  if (keys.left) player.vx = -player.speed;
  if (keys.right) player.vx = player.speed;
  if (keys.up && player.onGround) {
    player.vy = player.jumpPower;
    player.onGround = false;
  }

  player.vy += 0.5;
  player.x += player.vx;
  player.y += player.vy;
  player.onGround = false;

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  platforms.forEach(p => {
    const playerBottom = player.y + player.height;
    const playerOldBottom = playerBottom - player.vy;
    const isAbove = playerOldBottom <= p.y;
    const isFalling = player.vy >= 0;
    const withinX = player.x + player.width > p.x && player.x < p.x + p.width;

    if (isAbove && isFalling && withinX && 
        playerBottom >= p.y && playerBottom <= p.y + p.height) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
      player.x += p.vx;
    }
  });

  if (!coin.collected &&
      player.x < coin.x + coin.width &&
      player.x + player.width > coin.x &&
      player.y < coin.y + coin.height &&
      player.y + player.height > coin.y) {
    score += 10;
    coin.collected = true;
    shufflePlatforms();
    showRandomFact();
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  if (factActive) {
    factTimer--;
    if (factTimer <= 0) factActive = false;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  ctx.fillStyle = "#E8F4FD";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  ctx.fillStyle = "#D2B48C";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 5);
    ctx.lineTo(p.x + p.width, p.y + 5);
    ctx.stroke();
  });

  if (!coin.collected) {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#005BAE";
    ctx.fillRect(coin.x + 8, coin.y + 6, 10, 14);
    ctx.fillRect(coin.x + 4, coin.y + 11, 18, 4);
    ctx.strokeStyle = "#FFA500";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "#FFC301";
  ctx.fillRect(player.x + 8, player.y + 4, 6, 16);
  ctx.fillRect(player.x + 2, player.y + 10, 18, 4);

  // UI: Punkte + Fun Fact (OBEN RECHTS)
  ctx.fillStyle = "rgba(0, 91, 174, 0.9)";
  ctx.fillRect(10, 5, canvas.width - 20, 70);

  ctx.fillStyle = "#FFC301";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Punkte: " + score, 25, 30);

  ctx.font = "bold 32px Arial";
  ctx.fillText(score, 25, 55);

  if (factActive) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "right";
    ctx.fillText(funFact, canvas.width - 25, 35);
  }

  ctx.textAlign = "left";
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

spawnCoin();
gameLoop();
