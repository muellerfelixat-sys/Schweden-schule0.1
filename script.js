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
  vx: 0,
  vy: 0,
  speed: 4,
  jumpPower: -10,
  onGround: false
};

// Boden / Plattform-Grundlinie (für ganz unten)
const groundY = 350;

// Mehrere Plattformen, die sich horizontal bewegen
const platforms = [
  {
    x: 100,
    y: 280,
    width: 120,
    height: 20,
    vx: 2, // Bewegungsgeschwindigkeit nach rechts
    rangeLeft: 80,
    rangeRight: 300
  },
  {
    x: 400,
    y: 230,
    width: 120,
    height: 20,
    vx: -2,
    rangeLeft: 350,
    rangeRight: 650
  },
  {
    x: 200,
    y: 180,
    width: 100,
    height: 20,
    vx: 1.5,
    rangeLeft: 150,
    rangeRight: 500
  }
];

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
  // Plattformen bewegen
  platforms.forEach(p => {
    p.x += p.vx;
    if (p.x < p.rangeLeft || p.x + p.width > p.rangeRight) {
      p.vx *= -1; // Richtung umdrehen
    }
  });

  // Spieler-Bewegung links/rechts
  player.vx = 0;
  if (keys.left) {
    player.vx = -player.speed;
  }
  if (keys.right) {
    player.vx = player.speed;
  }

  // Springen nur, wenn am Boden / auf Plattform
  if (keys.up && player.onGround) {
    player.vy = player.jumpPower;
    player.onGround = false;
  }

  // Schwerkraft
  player.vy += 0.5;

  // Position aktualisieren
  player.x += player.vx;
  player.y += player.vy;

  // Erstmal annehmen: Spieler ist in der Luft
  player.onGround = false;

  // Kollision mit Boden
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  // Kollision mit Plattformen (von oben)
  platforms.forEach(p => {
    const playerBottom = player.y + player.height;
    const playerOldBottom = playerBottom - player.vy; // wo er vorher war

    const isAbovePlatformBefore = playerOldBottom <= p.y;
    const isFalling = player.vy >= 0;
    const withinX =
      player.x + player.width > p.x &&
      player.x < p.x + p.width;

    if (isAbovePlatformBefore && isFalling && withinX && playerBottom >= p.y && playerBottom <= p.y + p.height) {
      // Auf Plattform landen
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;

      // Spieler ein Stück mit Plattform mitbewegen
      player.x += p.vx;
    }
  });

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

  // Plattformen zeichnen
  ctx.fillStyle = "lightblue";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

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
