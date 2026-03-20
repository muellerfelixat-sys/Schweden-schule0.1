// Canvas holen
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Spieler-Objekt
const player = {
  x: 50,
  y: 300,
  width: 40,
  height: 40,
  color: "orange",
  vx: 0,          // Geschwindigkeit x
  vy: 0,          // Geschwindigkeit y
  speed: 4,       // Laufgeschwindigkeit
  jumpPower: -10, // Sprungstärke
  onGround: false
};

// Boden / Plattform
const groundY = 350; // Höhe des Bodens

// Tastatur-Eingaben
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

// Spiel-Update
function update() {
  // Links/Rechts bewegen
  player.vx = 0;
  if (keys.left) {
    player.vx = -player.speed;
  }
  if (keys.right) {
    player.vx = player.speed;
  }

  // Springen nur, wenn am Boden
  if (keys.up && player.onGround) {
    player.vy = player.jumpPower;
    player.onGround = false;
  }

  // Schwerkraft
  player.vy += 0.5; // je größer, desto schneller fällt er

  // Position updaten
  player.x += player.vx;
  player.y += player.vy;

  // Boden-Kollision
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  // Begrenzung links/rechts
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

// Zeichnen
function draw() {
  // Hintergrund löschen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Boden zeichnen
  ctx.fillStyle = "green";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  // Spieler zeichnen
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Game-Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Spiel starten
gameLoop();
