const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const crystalsText = document.getElementById("crystals");
const livesText = document.getElementById("lives");
const messageText = document.getElementById("message");

const characterScreen = document.getElementById("characterScreen");
const gameArea = document.getElementById("gameArea");
const chooseValentinaButton = document.getElementById("chooseValentina");
const chooseTaynaButton = document.getElementById("chooseTayna");
const backToCharacterButton = document.getElementById("backToCharacter");
const pauseButton = document.getElementById("pauseButton");
const restartGameButton = document.getElementById("restartGameBtn");

const keys = {
  left: false,
  right: false,
  jump: false
};

const gravity = 0.7;
const friction = 0.82;

const images = {
  valentina: new Image(),
  tayna: new Image(),
  castelo: new Image(),
  cristal: new Image(),
  dinoPequeno: new Image(),
  trex: new Image(),
  trexHit: new Image()
};

images.valentina.src = "./assets/imagens/valentina.png";
images.tayna.src = "./assets/imagens/tayna.png";
images.castelo.src = "./assets/imagens/castelo.png";
images.cristal.src = "./assets/imagens/cristal.png";
images.dinoPequeno.src = "./assets/imagens/dino-pequeno.png";
images.trex.src = "./assets/imagens/trex.png";
images.trexHit.src = "./assets/imagens/trex-hit.png";

let animationFrame = 0;
let playerDirection = 1;

const sounds = {
  finalGame: new Audio("./assets/sons/finalGame.mp3"),
  looseGame: new Audio("./assets/sons/looseGame.mp3"),
  winnerGame: new Audio("./assets/sons/winnerGame.mp3"),
  takeCoin: new Audio("./assets/sons/takeCoin.mp3"),
  enemy: new Audio("./assets/sons/enemy.mp3"),
  jump: new Audio("./assets/sons/jump.mp3"),
  enemyWinner: new Audio("./assets/sons/enemyWinner.mp3"),
  music: new Audio("./assets/sons/music.mp3")
};

sounds.music.loop = true;
sounds.music.volume = 0.7;

let soundEnabled = true;
let finalMusicStopped = false;

function imageIsReady(image) {
  return image && image.complete && image.naturalWidth > 0;
}

function playSound(soundName) {
  if (!soundEnabled || !sounds[soundName]) {
    return;
  }

  try {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play();
  } catch (error) {
    console.log(`Não foi possível tocar o som: ${soundName}`);
  }
}

function startBackgroundMusic() {
  if (!soundEnabled) {
    return;
  }

  try {
    sounds.music.pause();
    sounds.music.currentTime = 0;
    sounds.music.volume = 0.7;
    sounds.music.play();
  } catch (error) {
    console.log("A música só poderá iniciar após uma interação do usuário.");
  }
}

function stopBackgroundMusic() {
  try {
    sounds.music.pause();
    sounds.music.currentTime = 0;
  } catch (error) {
    console.log("Não foi possível parar a música.");
  }
}

const BOSS_STOMP_COOLDOWN = 180;
const BOSS_MAX_HEALTH = 5;
const BOSS_KNOCKBACK_SPEED = 14;
const BOSS_KNOCKBACK_DISTANCE_FROM_EDGE = 20;

let score = 0;
let crystalsCollected = 0;
let lives = 3;
let currentLevel = 0;
let checkpointLevel = 0;
let gameStarted = false;
let selectedCharacter = null;
let gameState = "menu";
let invincibleTimer = 0;

const player = {
  x: 70,
  y: 500,
  width: 36,
  height: 48,
  velocityX: 0,
  velocityY: 0,
  speed: 0.75,
  maxSpeed: 6.5,
  jumpForce: 15,
  onGround: false,
  dressColor: "#ff4fa3",
  dressDetailColor: "#ff80ab"
};

const levels = [
  {
    name: "Fase 1: Vale Encantado",
    startPosition: { x: 70, y: 500 },
    message: "Colete os cristais e chegue ao castelo!",
    groundY: 625,
    completed: false,
    platforms: [
      { x: 0, y: 625, width: 1200, height: 50 },
      { x: 160, y: 520, width: 180, height: 24 },
      { x: 420, y: 440, width: 180, height: 24 },
      { x: 690, y: 360, width: 180, height: 24 },
      { x: 910, y: 500, width: 180, height: 24 }
    ],
    crystals: [
      { x: 220, y: 480, size: 18, collected: false },
      { x: 500, y: 400, size: 18, collected: false },
      { x: 760, y: 320, size: 18, collected: false },
      { x: 980, y: 460, size: 18, collected: false }
    ],
    enemies: [
      { x: 380, y: 589, width: 42, height: 36, minX: 340, maxX: 560, speed: 1.6, alive: true },
      { x: 720, y: 589, width: 42, height: 36, minX: 660, maxX: 860, speed: 1.8, alive: true }
    ],
    goalCastle: { x: 1020, y: 455, width: 140, height: 170 },
    hasBoss: false
  },
  {
    name: "Fase 2: Floresta Perdida",
    startPosition: { x: 70, y: 500 },
    message: "Atravesse a floresta perdida e cuidado com os dinos rápidos!",
    groundY: 625,
    completed: false,
    platforms: [
      { x: 0, y: 625, width: 1200, height: 50 },
      { x: 120, y: 540, width: 130, height: 24 },
      { x: 320, y: 470, width: 120, height: 24 },
      { x: 520, y: 395, width: 130, height: 24 },
      { x: 730, y: 320, width: 120, height: 24 },
      { x: 930, y: 420, width: 130, height: 24 },
      { x: 1040, y: 535, width: 120, height: 24 }
    ],
    crystals: [
      { x: 170, y: 500, size: 18, collected: false },
      { x: 370, y: 430, size: 18, collected: false },
      { x: 580, y: 355, size: 18, collected: false },
      { x: 785, y: 280, size: 18, collected: false },
      { x: 985, y: 380, size: 18, collected: false },
      { x: 1100, y: 495, size: 18, collected: false }
    ],
    enemies: [
      { x: 280, y: 589, width: 42, height: 36, minX: 230, maxX: 420, speed: 2.2, alive: true },
      { x: 540, y: 589, width: 42, height: 36, minX: 490, maxX: 700, speed: 2.4, alive: true },
      { x: 780, y: 284, width: 42, height: 36, minX: 735, maxX: 835, speed: 1.9, alive: true },
      { x: 965, y: 384, width: 42, height: 36, minX: 930, maxX: 1040, speed: 2.0, alive: true }
    ],
    goalCastle: { x: 1040, y: 455, width: 140, height: 170 },
    hasBoss: false
  },
  {
    name: "Fase 3: Castelo do T-Rex",
    startPosition: { x: 70, y: 500 },
    message: "Suba nas plataformas e pule 5 vezes na cabeça do T-Rex!",
    groundY: 625,
    completed: false,
    platforms: [
      { x: 0, y: 625, width: 1200, height: 50 },
      { x: 150, y: 525, width: 160, height: 24 },
      { x: 370, y: 460, width: 160, height: 24 },
      { x: 650, y: 520, width: 110, height: 24 },
      { x: 785, y: 455, width: 110, height: 24 },
      { x: 920, y: 390, width: 110, height: 24 }
    ],
    crystals: [
      { x: 210, y: 485, size: 18, collected: false },
      { x: 430, y: 420, size: 18, collected: false },
      { x: 705, y: 480, size: 18, collected: false },
      { x: 840, y: 415, size: 18, collected: false },
      { x: 975, y: 350, size: 18, collected: false }
    ],
    enemies: [
      { x: 315, y: 589, width: 42, height: 36, minX: 280, maxX: 440, speed: 1.8, alive: true }
    ],
    goalCastle: { x: 1040, y: 455, width: 140, height: 170 },
    hasBoss: true,
    boss: {
      x: 850,
      y: 438,
      width: 240,
      height: 187,
      minX: 120,
      maxX: 1160,
      speed: 2.2,
      health: BOSS_MAX_HEALTH,
      alive: true,
      hitCooldown: 0,
      facing: -1,
      isKnockback: false,
      knockbackTargetX: 850
    }
  }
];

function getLevel() {
  return levels[currentLevel];
}

async function tryLandscapeMode() {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }

    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock("landscape");
    }
  } catch (error) {
    console.log("Não foi possível travar a orientação neste navegador.");
  }
}

function chooseCharacter(characterName) {
  selectedCharacter = characterName;

  if (characterName === "valentina") {
    player.dressColor = "#ff4fa3";
    player.dressDetailColor = "#ff80ab";
  }

  if (characterName === "tayna") {
    player.dressColor = "#42a5f5";
    player.dressDetailColor = "#90caf9";
  }

  characterScreen.classList.add("hidden");
  gameArea.classList.remove("hidden");

  gameStarted = true;
  gameState = "playing";

  tryLandscapeMode();
  resetGame();
  startBackgroundMusic();

  updateHud(`${characterName === "valentina" ? "Valentina" : "Tayná"} escolhida! Vamos para a aventura.`);
}

function backToCharacterSelection() {
  gameStarted = false;
  selectedCharacter = null;
  gameState = "menu";

  characterScreen.classList.remove("hidden");
  gameArea.classList.add("hidden");

  stopBackgroundMusic();
  resetAllGameData();
  updateHud("Escolha Valentina ou Tayná para começar!");
}

function resetAllGameData() {
  score = 0;
  crystalsCollected = 0;
  lives = 3;
  currentLevel = 0;
  checkpointLevel = 0;
  invincibleTimer = 0;
  finalMusicStopped = false;
  animationFrame = 0;
  playerDirection = 1;

  levels.forEach(level => {
    level.completed = false;

    level.crystals.forEach(crystal => {
      crystal.collected = false;
    });

    level.enemies.forEach(enemy => {
      enemy.alive = true;
    });

    if (level.hasBoss && level.boss) {
      level.boss.health = BOSS_MAX_HEALTH;
      level.boss.alive = true;
      level.boss.hitCooldown = 0;
      level.boss.x = 850;
      level.boss.y = 438;
      level.boss.speed = 2.2;
      level.boss.facing = -1;
      level.boss.isKnockback = false;
      level.boss.knockbackTargetX = 850;
    }
  });

  resetPlayer();
}

function resetGame() {
  const currentDressColor = player.dressColor;
  const currentDressDetailColor = player.dressDetailColor;
  const currentSelectedCharacter = selectedCharacter;

  resetAllGameData();

  player.dressColor = currentDressColor;
  player.dressDetailColor = currentDressDetailColor;
  selectedCharacter = currentSelectedCharacter;

  gameState = "playing";
  pauseButton.textContent = "Pausar";
  startBackgroundMusic();
  updateRestartButtonVisibility();
  updateHud(getLevel().message);
}

function resetPlayer() {
  const level = getLevel();

  player.x = level.startPosition.x;
  player.y = level.startPosition.y;
  player.velocityX = 0;
  player.velocityY = 0;
  player.onGround = false;
}

function resetCurrentLevelAfterLifeLoss() {
  currentLevel = checkpointLevel;
  resetPlayer();
}

function updateHud(message) {
  scoreText.textContent = `Pontos: ${score}`;
  crystalsText.textContent = `Cristais: ${crystalsCollected}`;

  let hearts = "";

  for (let i = 1; i <= 3; i++) {
    if (i <= lives) {
      hearts += "❤️";
    } else {
      hearts += "🩶";
    }
  }

  livesText.textContent = `Vidas: ${hearts}`;

  if (gameStarted) {
    messageText.textContent = `${getLevel().name} | ${message}`;
  } else {
    messageText.textContent = message;
  }
}

function updateRestartButtonVisibility() {
  if (!restartGameButton) {
    return;
  }

  if (gameState === "gameOver" || gameState === "gameWon") {
    restartGameButton.classList.remove("hidden");

    if (gameState === "gameWon") {
      restartGameButton.textContent = "JOGAR NOVAMENTE";
    } else {
      restartGameButton.textContent = "REINICIAR";
    }
  } else {
    restartGameButton.classList.add("hidden");
  }
}

function rectsCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function playerIsStomping(target) {
  const previousBottom = player.y + player.height - player.velocityY;
  const currentBottom = player.y + player.height;
  const isFalling = player.velocityY > 0;

  const cameFromAbove = previousBottom <= target.y + 34;
  const isTouchingTop = currentBottom <= target.y + 55;

  return isFalling && cameFromAbove && isTouchingTop;
}

function playerIsOnTopOfTarget(target) {
  const playerBottom = player.y + player.height;
  const playerCenterX = player.x + player.width / 2;

  const isHorizontallyInside =
    playerCenterX > target.x &&
    playerCenterX < target.x + target.width;

  const isNearTop =
    playerBottom >= target.y &&
    playerBottom <= target.y + 60;

  return isHorizontallyInside && isNearTop;
}

function playerIsStandingOnUpperPlatform() {
  const level = getLevel();
  const playerBottom = player.y + player.height;

  return level.platforms.some(platform => {
    const isGroundPlatform = platform.y >= level.groundY;

    if (isGroundPlatform) {
      return false;
    }

    const isHorizontallyOverPlatform =
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width;

    const isStandingOnPlatform =
      Math.abs(playerBottom - platform.y) <= 3;

    return isHorizontallyOverPlatform && isStandingOnPlatform && player.onGround;
  });
}

function loseLife() {
  if (invincibleTimer > 0 || gameState !== "playing") {
    return;
  }

  lives--;
  invincibleTimer = 90;

  playSound("enemy");

  if (lives <= 0) {
    stopBackgroundMusic();
    playSound("looseGame");

    gameState = "gameOver";
    updateRestartButtonVisibility();
    updateHud("Fim de jogo! Clique em REINICIAR para jogar novamente.");
    return;
  }

  resetCurrentLevelAfterLifeLoss();
  updateHud("Cuidado! Você perdeu uma vida e voltou ao início da fase.");
}

function completeLevel() {
  const level = getLevel();

  if (!level.completed) {
    score += 100;
    level.completed = true;
  }

  checkpointLevel = currentLevel + 1;

  if (currentLevel < levels.length - 1) {
    playSound("winnerGame");
    gameState = "levelComplete";
    updateRestartButtonVisibility();
    updateHud("Fase concluída! Pressione ENTER ou PULAR para continuar.");
  } else {
    playSound("winnerGame");

    const lifeBonus = lives * 100;
    score += lifeBonus;
    gameState = "gameWon";
    updateRestartButtonVisibility();
    updateHud(`Vocês chegaram ao castelo mágico! Bônus de vidas: ${lifeBonus} pontos.`);
  }
}

function goToNextLevel() {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    checkpointLevel = currentLevel;
    resetPlayer();
    gameState = "playing";
    startBackgroundMusic();
    updateRestartButtonVisibility();
    updateHud(getLevel().message);
  }
}

function togglePause() {
  if (!gameStarted) {
    return;
  }

  if (gameState === "playing") {
    gameState = "paused";
    pauseButton.textContent = "Continuar";
    sounds.music.pause();
    updateRestartButtonVisibility();
    updateHud("Jogo pausado.");
    return;
  }

  if (gameState === "paused") {
    gameState = "playing";
    pauseButton.textContent = "Pausar";
    sounds.music.play();
    updateRestartButtonVisibility();
    updateHud(getLevel().message);
  }
}

function drawBackground() {
  const level = getLevel();

  if (currentLevel === 0) {
    ctx.fillStyle = "#7bd3ff";
  } else if (currentLevel === 1) {
    ctx.fillStyle = "#8be48b";
  } else {
    ctx.fillStyle = "#ffb36b";
  }

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSun();
  drawCloud(110, 90);
  drawCloud(390, 120);
  drawCloud(720, 80);

  if (currentLevel === 0) {
    drawBalloon(80, 270, "#ff4fa3");
    drawBalloon(1120, 250, "#7c4dff");
    drawBalloon(610, 240, "#00c853");

    drawPalmTree(650, 500);
    drawVolcano(760, 485);
  }

  if (currentLevel === 1) {
    ctx.fillStyle = "rgba(0, 80, 40, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawPalmTree(90, 500);
    drawPalmTree(320, 500);
    drawPalmTree(640, 500);
    drawPalmTree(950, 500);

    ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
    ctx.fillRect(0, 350, canvas.width, 60);
  }

  if (currentLevel === 2) {
    drawVolcano(50, 485);
    drawVolcano(1010, 485);
    drawPalmTree(540, 500);
  }

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(0, level.groundY + 30, canvas.width, canvas.height - level.groundY);
}

function drawSun() {
  ctx.fillStyle = "#ffd54a";
  ctx.beginPath();
  ctx.arc(1030, 105, 55, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.arc(x + 30, y - 10, 30, 0, Math.PI * 2);
  ctx.arc(x + 65, y, 24, 0, Math.PI * 2);
  ctx.fillRect(x, y, 65, 24);
  ctx.fill();
}

function drawBalloon(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 20, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 28);
  ctx.lineTo(x - 10, y + 70);
  ctx.stroke();
}

function drawCastle(x, y, width = 140, height = 170) {
  if (imageIsReady(images.castelo)) {
    const castleDrawWidth = width + 95;
    const castleDrawHeight = height + 105;

    const castleDrawX = x - 48;
    const castleDrawY = y + height - castleDrawHeight + 22;

    ctx.drawImage(images.castelo, castleDrawX, castleDrawY, castleDrawWidth, castleDrawHeight);
    return;
  }

  ctx.fillStyle = "#d98cff";
  ctx.fillRect(x, y + 45, 120, 125);
}

function drawVolcano(x, y) {
  ctx.fillStyle = "#6d4c41";
  ctx.beginPath();
  ctx.moveTo(x, y + 140);
  ctx.lineTo(x + 80, y);
  ctx.lineTo(x + 160, y + 140);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff7043";
  ctx.beginPath();
  ctx.moveTo(x + 64, y + 30);
  ctx.lineTo(x + 80, y);
  ctx.lineTo(x + 96, y + 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ef5350";
  ctx.fillRect(x + 74, y + 28, 12, 55);
}

function drawPalmTree(x, y) {
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(x + 28, y, 18, 125);

  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.ellipse(x + 35, y, 60, 18, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + 35, y + 5, 60, 18, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + 35, y - 8, 18, 60, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlatforms() {
  const level = getLevel();

  level.platforms.forEach(platform => {
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(platform.x, platform.y, platform.width, 8);

    ctx.fillStyle = "#6d4c41";
    ctx.fillRect(platform.x, platform.y + 8, platform.width, platform.height - 8);

    ctx.fillStyle = "#3e2723";
    ctx.fillRect(platform.x, platform.y + platform.height - 6, platform.width, 6);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  });
}

function drawPlayer() {
  if (invincibleTimer > 0 && Math.floor(invincibleTimer / 8) % 2 === 0) {
    return;
  }

  const image = selectedCharacter === "valentina" ? images.valentina : images.tayna;

  if (imageIsReady(image)) {
    const isWalking = keys.left || keys.right;
    const isJumping = !player.onGround;

    let bounce = 0;

    if (isWalking && !isJumping) {
      bounce = Math.sin(animationFrame * 0.25) * 3;
    }

    const drawWidth = player.width + 28;
    const drawHeight = isJumping ? player.height + 44 : player.height + 38;
    const drawX = player.x - 14;
    const drawY = player.y - 36 + bounce;

    ctx.save();

    if (playerDirection === 1) {
      ctx.translate(drawX + drawWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
    } else {
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }

    ctx.restore();
    return;
  }

  ctx.fillStyle = player.dressColor;
  ctx.fillRect(player.x, player.y + 18, player.width, player.height - 18);
}

function drawCrystals() {
  const level = getLevel();

  level.crystals.forEach(crystal => {
    if (crystal.collected) {
      return;
    }

    if (imageIsReady(images.cristal)) {
      const crystalWidth = 76;
      const crystalHeight = 88;

      ctx.drawImage(
        images.cristal,
        crystal.x - crystalWidth / 2,
        crystal.y - crystalHeight / 2,
        crystalWidth,
        crystalHeight
      );
      return;
    }

    ctx.fillStyle = "#b388ff";
    ctx.beginPath();
    ctx.moveTo(crystal.x, crystal.y - crystal.size);
    ctx.lineTo(crystal.x + crystal.size, crystal.y);
    ctx.lineTo(crystal.x, crystal.y + crystal.size);
    ctx.lineTo(crystal.x - crystal.size, crystal.y);
    ctx.closePath();
    ctx.fill();
  });
}

function drawEnemies() {
  const level = getLevel();

  level.enemies.forEach(enemy => {
    if (!enemy.alive) {
      return;
    }

    if (imageIsReady(images.dinoPequeno)) {
      const enemyDrawWidth = enemy.width + 28;
      const enemyDrawHeight = enemy.height + 28;
      const enemyDrawX = enemy.x - 14;
      const enemyDrawY = enemy.y + enemy.height - enemyDrawHeight + 4;

      ctx.save();

      if (enemy.speed < 0) {
        ctx.translate(enemyDrawX + enemyDrawWidth, enemyDrawY);
        ctx.scale(-1, 1);
        ctx.drawImage(images.dinoPequeno, 0, 0, enemyDrawWidth, enemyDrawHeight);
      } else {
        ctx.drawImage(images.dinoPequeno, enemyDrawX, enemyDrawY, enemyDrawWidth, enemyDrawHeight);
      }

      ctx.restore();
      return;
    }

    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(enemy.x, enemy.y + 8, enemy.width, enemy.height - 8);
  });
}

function drawBoss() {
  const level = getLevel();

  if (!level.hasBoss || !level.boss || !level.boss.alive) {
    return;
  }

  const boss = level.boss;
  const direction = boss.facing || -1;

  const useHitImage = boss.hitCooldown > BOSS_STOMP_COOLDOWN - 30;
  const bossImage = useHitImage && imageIsReady(images.trexHit) ? images.trexHit : images.trex;

  if (imageIsReady(bossImage)) {
    const bossDrawWidth = boss.width + 40;
    const bossDrawHeight = boss.height + 45;
    const bossDrawX = boss.x - 20;
    const bossDrawY = boss.y + boss.height - bossDrawHeight + 38;

    ctx.save();

    if (direction === -1) {
      ctx.translate(bossDrawX + bossDrawWidth, bossDrawY);
      ctx.scale(-1, 1);
      ctx.drawImage(bossImage, 0, 0, bossDrawWidth, bossDrawHeight);
    } else {
      ctx.drawImage(bossImage, bossDrawX, bossDrawY, bossDrawWidth, bossDrawHeight);
    }

    ctx.restore();
    drawBossLifeBar(boss);
    return;
  }

  ctx.fillStyle = "#1b5e20";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  drawBossLifeBar(boss);
}

function drawBossLifeBar(boss) {
  ctx.fillStyle = "#111111";
  ctx.fillRect(430, 30, 340, 28);

  ctx.fillStyle = "#ff1744";
  ctx.fillRect(435, 35, (boss.health / BOSS_MAX_HEALTH) * 330, 18);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";

  if (boss.hitCooldown > 0) {
    const seconds = Math.ceil(boss.hitCooldown / 60);
    ctx.fillText(`T-Rex protegido: ${seconds}s`, 600, 52);
  } else {
    ctx.fillText(`T-Rex Gigante: ${boss.health}/${BOSS_MAX_HEALTH}`, 600, 52);
  }
}

function drawTextOverlay(title, subtitle, footer = "Pressione ENTER ou PULAR para continuar") {
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffd54a";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, 250);

  ctx.fillStyle = "#ffffff";
  ctx.font = "26px Arial";
  ctx.fillText(subtitle, canvas.width / 2, 310);

  ctx.font = "20px Arial";
  ctx.fillText(footer, canvas.width / 2, 365);
}

function updatePlayer() {
  const level = getLevel();

  if (keys.left) {
    player.velocityX -= player.speed;
    playerDirection = -1;
  }

  if (keys.right) {
    player.velocityX += player.speed;
    playerDirection = 1;
  }

  if (keys.left || keys.right) {
    animationFrame++;
  } else {
    animationFrame = 0;
  }

  player.velocityX *= friction;
  player.velocityY += gravity;

  player.velocityX = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.velocityX));

  player.x += player.velocityX;
  player.y += player.velocityY;

  player.onGround = false;

  level.platforms.forEach(platform => {
    if (rectsCollide(player, platform)) {
      const previousBottom = player.y + player.height - player.velocityY;

      if (previousBottom <= platform.y) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.onGround = true;
      }
    }
  });

  if (keys.jump && player.onGround) {
    player.velocityY = -player.jumpForce;
    player.onGround = false;
    playSound("jump");
  }

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  if (player.y > canvas.height + 80) {
    loseLife();
  }

  if (invincibleTimer > 0) {
    invincibleTimer--;
  }
}

function updateEnemies() {
  const level = getLevel();

  level.enemies.forEach(enemy => {
    if (!enemy.alive) {
      return;
    }

    enemy.x += enemy.speed;

    if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
      enemy.speed *= -1;
    }

    if (rectsCollide(player, enemy)) {
      if (playerIsStomping(enemy)) {
        enemy.alive = false;
        player.velocityY = -10;
        score += 25;
        playSound("enemyWinner");
        updateHud("Boa! Você pulou em cima do dino! +25 pontos.");
      } else {
        loseLife();
      }
    }
  });
}

function updateBossKnockback(boss) {
  if (!boss.isKnockback) {
    return false;
  }

  const distance = boss.knockbackTargetX - boss.x;

  if (Math.abs(distance) <= BOSS_KNOCKBACK_SPEED) {
    boss.x = boss.knockbackTargetX;
    boss.isKnockback = false;
    return false;
  }

  boss.x += Math.sign(distance) * BOSS_KNOCKBACK_SPEED;
  return true;
}

function updateBoss() {
  const level = getLevel();

  if (!level.hasBoss || !level.boss || !level.boss.alive) {
    return;
  }

  const boss = level.boss;

  if (boss.hitCooldown > 0) {
    boss.hitCooldown--;
  }

  const isBeingKnockedBack = updateBossKnockback(boss);

  if (isBeingKnockedBack) {
    if (rectsCollide(player, boss)) {
      const isOnTopOfBoss = playerIsOnTopOfTarget(boss);

      if (isOnTopOfBoss) {
        player.y = boss.y - player.height;
        player.velocityY = -8;
      } else {
        loseLife();
      }
    }

    return;
  }

  const playerCenter = player.x + player.width / 2;
  const bossCenter = boss.x + boss.width / 2;
  const distanceToPlayer = playerCenter - bossCenter;
  const absoluteDistance = Math.abs(distanceToPlayer);
  const directionDeadZone = 45;

  if (absoluteDistance > directionDeadZone) {
    boss.facing = distanceToPlayer > 0 ? 1 : -1;
  }

  let currentBossSpeed = boss.speed;

  if (boss.hitCooldown > 0) {
    currentBossSpeed = boss.speed * 0.45;
  }

  if (absoluteDistance > directionDeadZone) {
    if (distanceToPlayer < 0) {
      boss.x -= currentBossSpeed;
    } else {
      boss.x += currentBossSpeed;
    }
  }

  if (absoluteDistance < 250 && absoluteDistance > directionDeadZone && boss.hitCooldown <= 0) {
    if (distanceToPlayer < 0) {
      boss.x -= boss.speed * 0.4;
    } else {
      boss.x += boss.speed * 0.4;
    }
  }

  if (boss.x < boss.minX) {
    boss.x = boss.minX;
  }

  if (boss.x + boss.width > boss.maxX) {
    boss.x = boss.maxX - boss.width;
  }

  if (!rectsCollide(player, boss)) {
    return;
  }

  const isStompingBoss = playerIsStomping(boss);
  const isOnTopOfBoss = playerIsOnTopOfTarget(boss);
  const isStandingOnPlatform = playerIsStandingOnUpperPlatform();

  if (isStandingOnPlatform && isOnTopOfBoss) {
    updateHud("Saia da plataforma e pule diretamente na cabeça do T-Rex!");
    return;
  }

  if (isStompingBoss && boss.hitCooldown <= 0 && !isStandingOnPlatform) {
    boss.health--;
    boss.hitCooldown = BOSS_STOMP_COOLDOWN;
    player.velocityY = -17;

    playSound("enemyWinner");

    if (player.x < canvas.width / 2) {
      boss.knockbackTargetX = boss.maxX - boss.width - BOSS_KNOCKBACK_DISTANCE_FROM_EDGE;
      boss.facing = -1;
    } else {
      boss.knockbackTargetX = boss.minX + BOSS_KNOCKBACK_DISTANCE_FROM_EDGE;
      boss.facing = 1;
    }

    boss.isKnockback = true;

    if (boss.knockbackTargetX > canvas.width / 2) {
      player.x = Math.max(20, player.x - 35);
    } else {
      player.x = Math.min(canvas.width - player.width - 20, player.x + 35);
    }

    if (boss.health <= 0) {
      boss.alive = false;
      score += 300;
      playSound("finalGame");
      updateHud("O T-Rex foi derrotado! +300 pontos. Agora corram para o castelo!");
    } else {
      updateHud(`Acertou o T-Rex! Ele foi arremessado. Aguarde 3 segundos. Faltam ${boss.health} pulos.`);
    }

    return;
  }

  if (isOnTopOfBoss && boss.hitCooldown > 0) {
    player.y = boss.y - player.height;
    player.velocityY = -8;
    updateHud("O T-Rex está protegido! Espere 3 segundos para pular de novo na cabeça.");
    return;
  }

  if (!isOnTopOfBoss) {
    loseLife();
  }
}

function checkCrystalCollection() {
  const level = getLevel();

  level.crystals.forEach(crystal => {
    const crystalBox = {
      x: crystal.x - crystal.size,
      y: crystal.y - crystal.size,
      width: crystal.size * 2,
      height: crystal.size * 2
    };

    if (!crystal.collected && rectsCollide(player, crystalBox)) {
      crystal.collected = true;
      crystalsCollected++;
      score += 10;
      playSound("takeCoin");
      updateHud("Cristal mágico coletado! +10 pontos.");
    }
  });
}

function checkGoal() {
  const level = getLevel();

  if (!rectsCollide(player, level.goalCastle)) {
    return;
  }

  if (level.hasBoss && level.boss && level.boss.alive) {
    updateHud("Antes de entrar no castelo, derrote o T-Rex gigante!");
    return;
  }

  completeLevel();
}

function drawGame() {
  drawBackground();
  drawPlatforms();
  drawCrystals();
  drawEnemies();

  const level = getLevel();

  drawCastle(level.goalCastle.x, level.goalCastle.y, level.goalCastle.width, level.goalCastle.height);
  drawBoss();
  drawPlayer();
}

function gameLoop() {
  if (!gameStarted) {
    requestAnimationFrame(gameLoop);
    return;
  }

  drawGame();
  updateRestartButtonVisibility();

  if (gameState === "playing") {
    updatePlayer();
    updateEnemies();
    updateBoss();
    checkCrystalCollection();
    checkGoal();
  }

  if (gameState === "levelComplete") {
    drawTextOverlay("Fase concluída!", "Prepare-se para a próxima aventura.");
  }

  if (gameState === "paused") {
    drawTextOverlay("Jogo pausado", "Respire um pouco e continue quando quiser.", "Pressione P ou clique em Continuar");
  }

  if (gameState === "gameWon") {
    if (!finalMusicStopped) {
      stopBackgroundMusic();
      finalMusicStopped = true;
    }

    drawTextOverlay(
      "Parabéns, Valentina e Tayná!",
      `Vocês salvaram a festa! Pontuação final: ${score}`,
      "Clique em JOGAR NOVAMENTE para começar outra aventura"
    );
  }

  if (gameState === "gameOver") {
    drawTextOverlay(
      "Ops! Vamos tentar de novo?",
      "O Reino dos Dinossauros ainda precisa de vocês!",
      "Clique em REINICIAR para jogar novamente"
    );
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", event => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = true;
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = true;
  }

  if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") {
    keys.jump = true;

    if (gameState === "levelComplete") {
      goToNextLevel();
    }
  }

  if (event.code === "Enter" && gameState === "levelComplete") {
    goToNextLevel();
  }

  if (event.code === "KeyP") {
    togglePause();
  }

  if (event.code === "KeyR") {
    if (gameStarted) {
      resetGame();
    }
  }
});

document.addEventListener("keyup", event => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = false;
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = false;
  }

  if (event.code === "ArrowUp" || event.code === "KeyW" || event.code === "Space") {
    keys.jump = false;
  }
});

function setupMobileButton(buttonId, keyName) {
  const button = document.getElementById(buttonId);

  if (!button) {
    return;
  }

  const pressButton = event => {
    event.preventDefault();

    if (gameState === "levelComplete" && keyName === "jump") {
      goToNextLevel();
      return;
    }

    keys[keyName] = true;
  };

  const releaseButton = event => {
    event.preventDefault();
    keys[keyName] = false;
  };

  button.addEventListener("touchstart", pressButton, { passive: false });
  button.addEventListener("touchend", releaseButton, { passive: false });
  button.addEventListener("touchcancel", releaseButton, { passive: false });

  button.addEventListener("pointerdown", pressButton);
  button.addEventListener("pointerup", releaseButton);
  button.addEventListener("pointerleave", releaseButton);
  button.addEventListener("pointercancel", releaseButton);
}

setupMobileButton("leftBtn", "left");
setupMobileButton("rightBtn", "right");
setupMobileButton("jumpBtn", "jump");

chooseValentinaButton.addEventListener("click", () => {
  chooseCharacter("valentina");
});

chooseTaynaButton.addEventListener("click", () => {
  chooseCharacter("tayna");
});

backToCharacterButton.addEventListener("click", () => {
  backToCharacterSelection();
});

pauseButton.addEventListener("click", () => {
  togglePause();
});

if (restartGameButton) {
  restartGameButton.addEventListener("click", () => {
    resetGame();
  });
}

updateHud("Escolha Valentina ou Tayná para começar!");
gameLoop();
