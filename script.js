// Canvas holen
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Punktezähler
let score = 0;

// Spieler-Objekt
const player = {
  x: 50,
  y: 300,
  width: 40,
  height: 40,
  color: "#005BAE", // Schwedisches Flaggenblau
  vx: 0,
  vy: 0,
  speed: 2,
  jumpPower: -12,
  onGround: false
};

// Boden
const groundY = 350;

// Münze (schwedische Krone)
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

// Schwedischer Himmel-Hintergrund
function drawBackground() {
  // Schwedischer blauer Himmel (Flaggenfarbe)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB");    // Helles Himmelblau
  gradient.addColorStop(0.5, "#4682B4");  // Mittleres Himmelblau
  gradient.addColorStop(1, "#1E3A8A");    // Dunkles Flaggenblau
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Schwedische Kiefern-Silhouette (schwarze Dreiecke)
  ctx.fillStyle = "#1a3c34";
  ctx.beginPath();
  ctx.moveTo(100, 370);
  ctx.lineTo(130, 340);
  ctx.lineTo(160, 370);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(500, 365);
  ctx.lineTo(530, 335);
  ctx.lineTo(560, 365);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(700, 375);
  ctx.lineTo(725, 345);
  ctx.lineTo(750, 375);
  ctx.fill();
}

// Münze zufällig spawnen
function spawnCoin() {
  coin.x = Math.random() * (canvas.width - coin.width - 50) + 25;
  coin.y = Math.random() * 200 + 50;
  coin.collected = false;
  coin.spawnTimer = 0;
}

// Plattformen zufällig repositionieren
function shufflePlatforms() {
  platforms.forEach(p => {
    p.x = Math.random() * (canvas.width - p.width - 100) + 50;
    p.y = Math.random() * 200 + 100;
    p.rangeLeft = p.x - 50;
    p.rangeRight = p.x + 200;
    p.vx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
  });
}

// Update-Funktion
function update() {
  platforms.forEach(p => {
    p.x += p.vx;
    if (p.x < p.rangeLeft || p.x + p.width > p.rangeRight) {
      p.vx *= -1;
    }
  });

  if (coin.collected) {
    coin.spawnTimer++;
    if (coin.spawnTimer > 120) {
      spawnCoin();
    }
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

  if (!coin.collected &&
      player.x < coin.x + coin.width &&
      player.x + player.width > coin.x &&
      player.y < coin.y + coin.height &&
      player.y + player.height > coin.y) {
    score += 10;
    coin.collected = true;
    shufflePlatforms();
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Schwedisches Zeichnen
function draw() {
  drawBackground(); // Schwedischer Himmel + Kiefern

  // Schwedischer Schnee-Boden
  ctx.fillStyle = "#E8F4FD";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  
  // Schnee-Effekt (weiße Punkte)
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  for(let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc(Math.random()*canvas.width, Math.random()*200 + groundY, 2, 0, Math.PI*2);
    ctx.fill();
  }

  // Schwedische Holzzäune als Plattformen
  ctx.fillStyle = "#D2B48C"; // Holzfarbe
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
    
    // Holzzäune-Linien
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 5);
    ctx.lineTo(p.x + p.width, p.y + 5);
    ctx.stroke();
  });

  // Schwedische Krone (Münze mit Flaggenkreuz)
  if (!coin.collected) {
    // Goldene Krone
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Schwedisches Flaggenkreuz drauf
    ctx.fillStyle = "#005BAE";
    ctx.fillRect(coin.x + 8, coin.y + 6, 10, 14);
    ctx.fillRect(coin.x + 4, coin.y + 11, 18, 4);
    
    // Goldener Rand
    ctx.strokeStyle = "#FFA500";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Spieler (schwedische Flagge-Figur)
  ctx.fillStyle = player.color; // Flaggenblau
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  // Gelbes Flaggenkreuz auf Spieler
  ctx.fillStyle = "#FFC301";
  ctx.fillRect(player.x + 8, player.y + 4, 6, 16);
  ctx.fillRect(player.x + 2, player.y + 10, 18, 4);

  // Punktezähler (schwedische Flaggenfarben)
  ctx.fillStyle = "#005BAE";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Punkte: " + score, 20, 35);
  
  ctx.fillStyle = "#FFC301";
  ctx.font = "bold 26px Arial";
  ctx.fillText(score, 120, 36);
}

// Game-Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start
spawnCoin();
gameLoop();
