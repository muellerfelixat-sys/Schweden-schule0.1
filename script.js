// Canvas holen
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Punktezähler
let score = 0;

// Spieler-Objekt
const player = {
  speed: 2,
  x: 50,
  y: 300,
  width: 40,
  height: 40,
  color: "orange",
  vx: 0,
  vy: 0,
  speed: 4,
  jumpPower: -12,
  onGround: false
};

// Boden
const groundY = 350;

// Münze
const coin = {
  x: 0,
  y: 0,
  width: 25,
  height: 25,
  collected: false,
  spawnTimer: 0
};

// Plattformen
let platforms = [
  {
    x: 100,
    y: 280,
    width: 120,
    height: 20,
    vx: 1,
    rangeLeft: 80,
    rangeRight: 300
  },
  {
    x: 400,
    y: 230,
    width: 120,
    height: 20,
    vx: -1,
    rangeLeft: 350,
    rangeRight: 650
  },
  {
    x: 200,
    y: 180,
    width: 100,
    height: 20,
    vx: 1,
    rangeLeft: 150,
    rangeRight: 500
  }
];

// Tastatur
const keys = {
  left: false,
  right: false,
  up: false
};

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

// Münze zufällig spawnen
function spawnCoin() {
  coin.x = Math.random() * (canvas.width - coin.width - 50) + 25;
  coin.y = Math.random() * 200 + 50; // nicht zu tief
  coin.collected = false;
  coin.spawnTimer = 0;
}

// Plattformen zufällig repositionieren
function shufflePlatforms() {
  platforms.forEach(p => {
    p.x = Math.random() * (canvas.width - p.width - 100) + 50;
    p.y = Math.random() * 200 + 100; // zwischen 100-300 Höhe
    p.rangeLeft = p.x - 50;
    p.rangeRight = p.x + 200;
    p.vx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
  });
}

// Update-Funktion
function update() {
  // Plattformen bewegen
  platforms.forEach(p => {
    p.x += p.vx;
    if (p.x < p.rangeLeft || p.x + p.width > p.rangeRight) {
      p.vx *= -1;
    }
  });

  // Münze-Timer
  if (coin.collected) {
    coin.spawnTimer++;
    if (coin.spawnTimer > 120) { // nach 2 Sekunden neue Münze
      spawnCoin();
    }
  }

  // Spieler-Bewegung
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

  // Boden-Kollision
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  // Plattform-Kollision
  platforms.forEach(p => {
    const playerBottom = player.y + player.height;
    const playerOldBottom = playerBottom - player.vy;
    const isAbovePlatformBefore = playerOldBottom <= p.y;
    const isFalling = player.vy >= 0;
    const withinX = player.x + player.width > p.x && player.x < p.x + p.width;

    if (isAbovePlatformBefore && isFalling && withinX && 
        playerBottom >= p.y && playerBottom <= p.y + p.height) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
      player.x += p.vx;
    }
  });

  // Münze einsammeln
  if (!coin.collected &&
      player.x < coin.x + coin.width &&
      player.x + player.width > coin.x &&
      player.y < coin.y + coin.height &&
      player.y + player.height > coin.y) {
    score += 10;
    coin.collected = true;
    shufflePlatforms(); // Plattformen umsortieren!
  }

  // Begrenzungen
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Zeichnen
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Boden
  ctx.fillStyle = "green";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  // Plattformen
  ctx.fillStyle = "lightblue";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // Münze
  if (!coin.collected) {
    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Spieler
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Punktezähler (links oben)
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Punkte: " + score, 20, 35);
}

// Game-Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Spiel starten
spawnCoin(); // Erste Münze spawnen
gameLoop();
