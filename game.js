const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

///////////////////////////////////// Canvas Size Setting

// Fixed game resolution

canvas.width = 1280;
canvas.height = 720;

///////////////////////////////////// Media Files

// Preloaded Fonts
const Chicago = new FontFace("Chicago", "url(./assets/fonts/ChicagoFLF.ttf", {
    style: "normal",
    weight: "400",
    stretch: "condensed",
});

document.fonts.add(Chicago);

// Preloaded Bitmaps
const splashScreen = new Image();
splashScreen.src = "./assets/bitmaps/SplashScreen2.png";
const astroid01 = new Image();
astroid01.src = "./assets/bitmaps/astroid09.png";
const astroid02 = new Image();
astroid02.src = "./assets/bitmaps/astroid10.png";
const astroid03 = new Image();
astroid03.src = "./assets/bitmaps/astroid11.png";
const astroid04 = new Image();
astroid04.src = "./assets/bitmaps/astroid12.png";
const astroid05 = new Image();
astroid05.src = "./assets/bitmaps/astroid13.png";
const astroid06 = new Image();
astroid06.src = "./assets/bitmaps/astroid14.png";
const spaceship = new Image();
spaceship.src = "./assets/bitmaps/spaceship.png";
const fuelCrystal = new Image();
fuelCrystal.src = "./assets/bitmaps/fuelCrystal.png";
const exitPortalGreen = new Image();
exitPortalGreen.src = "./assets/bitmaps/exitPortalGreen.png";
const exitPortalRed = new Image();
exitPortalRed.src = "./assets/bitmaps/exitPortalRed.png";
const gameOver = new Image();
gameOver.src = "./assets/bitmaps/gameOver.jpg";
const explosion = new Image();
explosion.src = "./assets/bitmaps/explosion01.png";

// Preloaded Audio Files Variables Object
const sounds = {
    backgroundMusic: new Audio("./assets/sounds/backgroundMusic.ogg"),
    lostShield: new Audio("./assets/sounds/shieldLost.wav"),
    //enemySpawn: new Audio("./assets/sounds/enemySpawn.mp3"),
    bulletFired: new Audio("./assets/sounds/bulletFired.ogg"),
    enemyHit: new Audio("./assets/sounds/enemyHit.wav"),
    enemyHit02: new Audio("./assets/sounds/enemyHit02.wav"),
    engineSound: new Audio("./assets/sounds/engineSound.mp3"),
    //playerKilled: new Audio("./assets/sounds/playerKilled.mp3"),
    superBomb: new Audio("./assets/sounds/superBomb.mp3"),
    lowFuelAlert: new Audio("./assets/sounds/lowFuelAlert.mp3"),
    fuelHit: new Audio("./assets/sounds/fuelHit.ogg"),
    fuelAdded: new Audio("./assets/sounds/fuelAdded.wav"),
    usePortal: new Audio("./assets/sounds/usePortal.ogg"),
    gameOverSound: new Audio("./assets/sounds/gameOverSound.ogg")
};

///////////////////////////////////// Game Variables Initial Settings

// Sprite sheet properties
const frameWidth = 512; // Width of each frame in the sprite sheet
const frameHeight = 512; // Height of each frame in the sprite sheet
const numCols = 8; // Number of columns in the sprite sheet
const numRows = 8; // Number of rows in the sprite sheet
const totalFrames = numCols * numRows; // Total number of frames

// Animation properties
const fpsAnimation = 12; // Frames per second
const frameDuration = 1000 / fpsAnimation; // Duration of each frame in milliseconds
let lastFrameTime = 0;

//////SuperBomb Particle Logic
const particlesArray = [];

class Particle {
    constructor() {
        //this.x = mouse.x;
        //this.y = mouse.y;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.size = Math.random() * 15 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
        ctx.drawImage(explosion, this.x - (this.size / 1.1), this.y - (this.size / 1.1), this.size * 1.9, this.size * 1.9);
        //ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

function init() {
    for (let i = 0; i < 1000; i++) {
        particlesArray.push(new Particle());
        console.log(particlesArray[i]);
    }
}

function handleParticles() {
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        if (particlesArray[i].size <= 0.3) {
            particlesArray.splice(i, 1);
            i--;
        }
    }
}

// particlesArray.length

const FIRE_RATE = 300; // Fire rate in milliseconds
let lastFireTime = 0;  // Track the last fire time

let shieldLossCooldown = 0; // Cooldown time in frames or milliseconds
const SHIELD_LOSS_COOLDOWN_DURATION = 3000; // Cooldown duration in milliseconds (3 seconds)

// Settings for starfield
const numStars = 100; // Number of stars in the starfield
var starSpeed = .05; // Speed at which the stars move downward

// Array to store star objects
const stars = [];

// Gen Game Vars
let score = 0;
let Shields = 9;
let fuel = 100;
let fuelRate = 0.01;
let scoreIncrease = 0;
let shieldCheck = Shields;
let fuelNow = fuel;
let collisionCooldown = 0;
let superBombItem = 1;
let playerSpeed = 0;
let speedBoostActive = false;
let inMaze = false;
let gameStarted = false;
let bulletSize = 5;
let leftStickX = 0;
let leftStickY = 0;
let borderWidth = 20;
let monsterGenX = 20;
let monsterGenY = 75;
let exitPortalX = 75;
let exitPortalY = 20;
let gameLevel = 1;
let fuelLevelIncrease = 10;
let baseFuelRequirement = 50;
let exitFuelNeeded = 0;
let gameState = true; // New variable to track game state

// Default Player Variables
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5, // Maximum speed factor
    dx: 0,
    dy: 0,
    mass: 10 // Example mass value
};

const bullets = [];
const enemies = [];
const fuelItems = [];

// Friction coefficient for slowing down the player
const FRICTION = 0.99; // Adjust this value to increase or decrease friction (closer to 1 means less friction)

// Placeholder for gamepad controls
let gamepadConnected = false;

///////////////////////////////////// Game Functions

// Animation loop
function animation(time) {
    if (time - lastFrameTime > frameDuration) {
        // Calculate frame coordinates in the sprite sheet
        const frameX = currentFrame % numCols;
        const frameY = Math.floor(currentFrame / numCols);

        drawFrame(frameX, frameY);

        currentFrame++;
        if (currentFrame >= totalFrames) {
            currentFrame = 0; // Reset to loop the animation
        }

        lastFrameTime = time;
    }

    requestAnimationFrame(animate);
}

// Function to draw the current frame of the sprite sheet
function drawFrame(frameX, frameY) {
    console.log(`Drawing frame: X = ${frameX}, Y = ${frameY}`);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
        spriteSheet,
        frameX * frameWidth, // Source X
        frameY * frameHeight, // Source Y
        frameWidth, // Source width
        frameHeight, // Source height
        0, // Destination X
        0, // Destination Y
        canvas.width, // Destination width (scaled to fit the canvas)
        canvas.height // Destination height (scaled to fit the canvas)
    );
}

// GAME OVER SCREEN

function gameOverScreen() {
    resetAllSounds(); // Stop all sounds
    //ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.drawImage(gameOver, 0, 0, canvas.width, canvas.height);
    gameState = false; // Set game state to 'over'
}

function restartGame() {
    location.reload(); // Reload the page to reset the game
}

//DRAW PLAYER FUNCTION

function drawPlayer() {
    ctx.beginPath();
    ctx.drawImage(spaceship, player.x - (player.radius / 1.1), player.y - (player.radius / 1.1), player.radius * 1.9, player.radius * 1.9);
    ctx.fill();
    ctx.closePath();
}
// ONSCREEN BORDER

function drawBorder() {

    //Inner Border

    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, borderWidth, canvas.height);
    ctx.fill();
    ctx.closePath();


    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(canvas.width - borderWidth, 0, borderWidth / 2, canvas.height);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, canvas.width, borderWidth);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, canvas.height - borderWidth, canvas.width, borderWidth);
    ctx.fill();
    ctx.closePath();

    //Outer Border

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, borderWidth / 2, canvas.height);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width - borderWidth / 2, 0, borderWidth / 2, canvas.height);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, borderWidth / 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, canvas.height - borderWidth / 2, canvas.width, borderWidth / 2);
    ctx.fill();
    ctx.closePath();
}

// Monster Portals

function monsterPortals() {

    //Left Monster Portal

    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(borderWidth, canvas.height / 2 - monsterGenY / 2, monsterGenX, monsterGenY);
    ctx.fill();
    ctx.closePath();

    //Right Monster Portal

    ctx.beginPath();
    ctx.fillStyle = 'yellow';
    ctx.fillRect(canvas.width - (borderWidth + monsterGenX), canvas.height / 2 - monsterGenY / 2, monsterGenX, monsterGenY);
    ctx.fill();
    ctx.closePath()
}

// EXIT PORTAL FUNCTION

function exitPortal() {
    if (exitFuelNeeded <= fuel) {

        ctx.beginPath();
        ctx.drawImage(exitPortalGreen, canvas.width / 2 - exitPortalX / 2, canvas.height - (exitPortalY + borderWidth), exitPortalX, exitPortalY);
        ctx.fill();
        ctx.closePath();

    }
    if (exitFuelNeeded > fuel) {

        ctx.beginPath();
        ctx.drawImage(exitPortalRed, canvas.width / 2 - exitPortalX / 2, canvas.height - (exitPortalY + borderWidth), exitPortalX, exitPortalY);
        ctx.fill();
        ctx.closePath();

    }
    exitFuelNeeded = (gameLevel * fuelLevelIncrease) + baseFuelRequirement;
    ctx.font = "12px Chicago";
    ctx.fontWeight = 400;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText('Fuel: ' + (exitFuelNeeded), canvas.width / 2, canvas.height - 55);
    ctx.fill();
    ctx.closePath();

}

// Function to check collision with the exit portal
function checkExitCollision() {
    const portalX = canvas.width / 2 - exitPortalX / 2;
    const portalY = canvas.height - (exitPortalY + borderWidth);

    if (
        player.x + player.radius > portalX &&
        player.x - player.radius < portalX + exitPortalX &&
        player.y + player.radius > portalY &&
        player.y - player.radius < portalY + exitPortalY
    ) {
        // Player has collided with the exit portal
        handleExitCollision();
    }
}

// Function to handle what happens when player collides with the exit portal
function handleExitCollision() {
    // Calculate the required fuel to exit the level
    exitFuelNeeded = (gameLevel * fuelLevelIncrease) + baseFuelRequirement;

    if (fuel >= exitFuelNeeded) {
        // Player has enough fuel, generate a new level
        fuel = fuel - exitFuelNeeded;
        generateNewLevel();
    } else {
        // Not enough fuel, play sound or show message
        if (shieldLossCooldown <= 0) {  // Check if cooldown is over
            sounds.lowFuelAlert.play();
            Shields--;  // Reduce shield
            shieldLossCooldown = SHIELD_LOSS_COOLDOWN_DURATION;  // Start cooldown
        }
        // Optional: Show a message
        // alert('Not enough fuel to proceed to the next level!');
    }
}

// Function to generate a new level with faster enemies
function generateNewLevel() {
    gameLevel++;
    enemies.forEach((enemy) => {
        enemy.speed += 0.5; // Increase speed of existing enemies
    });
    // Optionally, add new enemies or other level-specific changes
    resetGame(); // Reset and start new level
}

// ONSCREEN HUD FUNCTION

function drawHUD() {

    ctx.font = "24px Chicago";
    ctx.fontWeight = 400;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText('Shields: <' + Math.round(Shields) + '> Score: <' + Math.round(score) + '> Fuel: <' + Math.round(fuel) + '> SuperBombs: <' + Math.round(superBombItem) + '>', canvas.width / 2, 25);
    ctx.fill();
    ctx.closePath();
}

// Function to initialize stars
function initStars() {
    for (let i = 0; i < numStars; i++) {
        stars.push(createStar());
    }
}

// Function to create a single star
function createStar() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1, // Random size between 1 and 3
        speed: (Math.random() * 5) * starSpeed + 1 // Random speed between 1 and starSpeed
    };
}

// Function to update star positions
function updateStars() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.y += star.speed;

        // If star moves off the canvas, reset it to the top
        if (star.y > canvas.height) {
            stars[i] = createStar();
            stars[i].y = 0; // Start at the top
        }
    }
}

// Function to draw stars on the canvas
function drawStars() {
    ctx.globalAlpha = 0.75;
    //ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';  // Stars are randomly multicolored
    ctx.fill();
    ctx.closePath();
    //ctx.fillStyle = 'white'; // Stars are white
    for (const star of stars) {
        ctx.beginPath();
        ctx.globalAlpha = 0.75;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1.0;
    }
}

// Function to animate the starfield
function animate() {
    updateStars();
    drawStars();
    // requestAnimationFrame(animate); //Already in Game Loop
}

function engineSoundNoise() {
    if (playerSpeed > 0.5) {
        sounds.engineSound.loop = true;
        sounds.engineSound.play();
        sounds.engineSound.volume = playerSpeed / 20;
    } else if (playerSpeed <= 0.5) {
        sounds.engineSound.loop = false;
        sounds.engineSound.pause();
    }
}

// Modify the ThrusterFire Animation function to check leftStickX and leftStickY
function drawRedCircle() {
    // Only draw the red circle if leftStickX or leftStickY is greater than zero
    //if (leftStickX > 0 || leftStickY > 0) {
    if (speedBoostActive > 0) {
        // Calculate the angle of the joystick input
        const angle = Math.atan2(leftStickY, leftStickX);

        // Adjust the angle to point in the opposite direction
        const oppositeAngle = angle + Math.PI; // Add 180 degrees (π radians) to the angle

        // Calculate the position of the red circle in the opposite direction
        const redCircleX = player.x + Math.cos(oppositeAngle) * (player.radius + player.radius * 0.25);
        const redCircleY = player.y + Math.sin(oppositeAngle) * (player.radius + player.radius * 0.25);

        // Draw the red circle
        ctx.beginPath();
        ctx.arc(redCircleX, redCircleY, player.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(redCircleX, redCircleY, player.radius * 0.125, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }
}

function superBombActivate() {
    bullets.length = 0;
    enemies.length = 0;
    //fuelItems.length = 0;
    sounds.superBomb.play();
    init();//activate Particles after SuperBomb

    for (i = 0; i < 1000; i++) {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fill();
        ctx.closePath();
    }

    superBombItem = superBombItem - 1;
}

function fireBullet(angle) {
    const currentTime = Date.now();
    if (currentTime - lastFireTime >= FIRE_RATE) {
        lastFireTime = currentTime;
        bullets.push({
            x: player.x,
            y: player.y,
            dx: Math.cos(angle) * 10,
            dy: Math.sin(angle) * 10,
            radius: 5
        });
        sounds.bulletFired.play();
    }
}

function resetAllSounds() {
    Object.values(sounds).forEach((sound) => {
        sound.pause();
        sound.currentTime = 0;
    });
}

// Start Button Function
function drawStartButton() {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(startButton.text, startButton.x + 10, startButton.y + 27);
    ctx.fill();
    ctx.closePath();
}

// Game Start Function
function startGame() {
    if (!gameStarted) {
        console.log('Game started');
        gameStarted = true;
        sounds.backgroundMusic.play();
        sounds.backgroundMusic.volume = 0.5;
        sounds.backgroundMusic.loop = true;
        requestAnimationFrame(gameLoop);
    }
    if (!gameState) {
        location.reload();//reload game
    }
}

function getPlayerSpeed() {
    return Math.sqrt(player.dx * player.dx + player.dy * player.dy);
}

// Modified fuel consumption check
function fuelCheck() {
    speed = fuel / 20;
    if (fuel >= 20) {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    } else if (fuel < 20) {
        ctx.beginPath();
        ctx.fillStyle = 'hsl(' + 360 * Math.random() + ', 50%, 50%)';
        ctx.fill();
        ctx.closePath();
        sounds.lowFuelAlert.play();

    }

    if (fuel <= 0) {
        sounds.lowFuelAlert.pause();
        sounds.backgroundMusic.pause();
        gameOverScreen();
    }

    if (getPlayerSpeed() > 0.5) {
        const fuelMultiplier = speedBoostActive ? 3 : 1;
        fuel -= getPlayerSpeed() * fuelRate * fuelMultiplier;
    }
}

// Update the updateGamepadInput function to set these global variables
function updateGamepadInput() {
    if (!gamepadConnected) return;

    const gamepad = navigator.getGamepads()[0];
    if (!gamepad) return;

    const deadzone = 0.15;

    // Apply deadzone for left stick (movement)
    leftStickX = Math.abs(gamepad.axes[0]) > deadzone ? gamepad.axes[0] : 0;
    leftStickY = Math.abs(gamepad.axes[1]) > deadzone ? gamepad.axes[1] : 0;

    // Acceleration and Speed Boost

    if (leftStickX !== 0 || leftStickY !== 0) {
        const accelerationFactor = 0.1 / player.mass;
        const boostMultiplier = speedBoostActive ? 2 : 1; // Apply boost multiplier if active
        player.dx += leftStickX * player.speed * accelerationFactor * boostMultiplier;
        player.dy += leftStickY * player.speed * accelerationFactor * boostMultiplier;
    }

    player.dx *= FRICTION;
    player.dy *= FRICTION;

    const rightStickX = Math.abs(gamepad.axes[2]) > deadzone ? gamepad.axes[2] : 0;
    const rightStickY = Math.abs(gamepad.axes[3]) > deadzone ? gamepad.axes[3] : 0;

    if (Math.abs(rightStickX) > 0 || Math.abs(rightStickY) > 0) {
        const angle = Math.atan2(rightStickY, rightStickX);
        fireBullet(angle);
    }
}

// Update player position
function updatePlayer(delta) {
    player.x += player.dx * delta;
    player.y += player.dy * delta;

    // Prevent the player from moving beyond the left and right blue borders
    if (player.x < borderWidth + player.radius) {
        player.x = borderWidth + player.radius;
        player.dx = 0; // Optionally, stop the player's movement in the X direction
    }
    if (player.x > canvas.width - borderWidth - player.radius) {
        player.x = canvas.width - borderWidth - player.radius;
        player.dx = 0; // Optionally, stop the player's movement in the X direction
    }

    // Prevent the player from moving beyond the top and bottom blue borders
    if (player.y < borderWidth + player.radius) {
        player.y = borderWidth + player.radius;
        player.dy = 0; // Optionally, stop the player's movement in the Y direction
    }
    if (player.y > canvas.height - borderWidth - player.radius) {
        player.y = canvas.height - borderWidth - player.radius;
        player.dy = 0; // Optionally, stop the player's movement in the Y direction
    }
}

// Update and draw bullets
function updateBullets(delta) {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx * delta;
        bullet.y += bullet.dy * delta;
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}

// Update and draw enemies
function updateEnemies() {
    if (Math.random() < 0.02) {
        const radius = Math.random() * 100 + 10; // Adjust size range as needed
        enemies.push({
            x: Math.random() * (canvas.width - 2 * radius) + radius, // Spawns within the canvas width but considers radius
            y: -radius, // Spawns just above the screen, considering its radius
            radius: radius,
            speed: 2,
            color: Math.round((Math.random() * 5) + 1)
        });
    }

    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        // Check if the entire enemy is off the screen to remove it
        if (enemy.y - enemy.radius > canvas.height) {
            enemies.splice(index, 1);
            if (Shields <= 0) {
                gameOverScreen();
            }
        }
    });
}

// Update and draw fuel items
function updateFuelItems() {
    if (Math.random() < 0.01) {
        fuelItems.push({
            x: Math.random() * canvas.width,
            y: -20,
            radius: 8,
            speed: (Math.random() * 1) + 1
        });
    }

    fuelItems.forEach((fuelItem, index) => {
        fuelItem.y += fuelItem.speed;
        if (fuelItem.y > canvas.height) {
            fuelItems.splice(index, 1);
        }
    });
}

// Update HUD (Deprecated)
function HUDUpdate() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('Shields').textContent = `Shields: ${Shields}`;
    document.getElementById('fuel').textContent = `Fuel: ${Math.round(fuel)}`;
    document.getElementById('superBombItem').textContent = `Super Bombs: ${superBombItem}`;
}

// Reset Function
function resetGame() {
    gameStarted = false;
    scoreIncrease = 0;
    superBombItem = 1;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.dx = 0;
    player.dy = 0;

    bullets.length = 0;
    enemies.length = 0;
    fuelItems.length = 0;

    Shields++;

    sounds.usePortal.play();
    gameStarted = true;
    sounds.backgroundMusic.play();
    //requestAnimationFrame(gameLoop);
}

function checkCollisions() {
    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = enemies[enemyIndex];
        if (enemy.x >= 0 && enemy.x <= canvas.width && enemy.y >= 0 && enemy.y <= canvas.height) {
            for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
                const bullet = bullets[bulletIndex];
                const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
                if (dist < enemy.radius + bullet.radius) {
                    //console.log(Collision detected between bullet and enemy at: bullet(${bullet.x}, ${bullet.y}), enemy(${enemy.x}, ${enemy.y}));
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 100;
                    break;
                }
            }

            const playerDist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (collisionCooldown <= 0 && playerDist < enemy.radius + player.radius) {
                //console.log(Collision detected between player and enemy at: player(${player.x}, ${player.y}), enemy(${enemy.x}, ${enemy.y}));
                enemies.splice(enemyIndex, 1);
                Shields--;
                collisionCooldown = 10;
                if (Shields <= 0) {
                    gameOverScreen();
                }
            }
        }
    }

    for (let fuelIndex = fuelItems.length - 1; fuelIndex >= 0; fuelIndex--) {
        const fuelItem = fuelItems[fuelIndex];
        if (fuelItem.x >= 0 && fuelItem.x <= canvas.width && fuelItem.y >= 0 && fuelItem.y <= canvas.height) {
            const dist = Math.hypot(fuelItem.x - player.x, fuelItem.y - player.y);
            if (dist < fuelItem.radius + player.radius) {
                //console.log(Collision detected between player and fuel item at: player(${player.x}, ${player.y}), fuelItem(${fuelItem.x}, ${fuelItem.y}));
                fuelItems.splice(fuelIndex, 1);
                fuel += 10;
                sounds.fuelAdded.play();
            }

            for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
                const bullet = bullets[bulletIndex];
                const bulletDist = Math.hypot(fuelItem.x - bullet.x, fuelItem.y - bullet.y);
                if (bulletDist < fuelItem.radius + bullet.radius) {
                    //console.log(Collision detected between bullet and fuel item at: bullet(${bullet.x}, ${bullet.y}), fuelItem(${fuelItem.x}, ${fuelItem.y}));
                    fuelItems.splice(fuelIndex, 1);
                    bullets.splice(bulletIndex, 1);
                    sounds.fuelHit.play();
                }
            }
        }
    }
}

let lastTime = 0;
const fps = 60;
const fpsInterval = 1000 / fps;

function gameLoop(currentTime) {

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    if (gameState === false) {
        sounds.engineSound.pause();
        sounds.gameOverSound.play();
        ctx.drawImage(gameOver, 0, 0, canvas.width, canvas.height);
        // Stop the game loop if the game is over
        return;
    }

    const deltaTime = currentTime - lastTime;
    checkExitCollision(); // Check if player has collided with Exit Portal
    if (deltaTime > fpsInterval) {
        const delta = deltaTime / fpsInterval;
        lastTime = currentTime - (deltaTime % fpsInterval);

        drawBorder(); //DRAW GAME SCREEN BORDER

        if (scoreIncrease < score) {
            sounds.enemyHit.play();
            sounds.enemyHit02.play();
            scoreIncrease = score;
        }

        if (shieldCheck > Shields) {
            sounds.lostShield.play();
            shieldCheck = Shields;
        }

        // Decrease Exit Portal Damage cooldown timer if it's active
        if (shieldLossCooldown > 0) {
            shieldLossCooldown -= deltaTime;
        }

        if (collisionCooldown > 0) collisionCooldown--;

        // Update all game elements
        handleParticles();
        updateGamepadInput();
        updatePlayer(delta);
        updateBullets(delta);
        updateEnemies(delta);
        updateFuelItems(delta);
        checkCollisions();
        engineSoundNoise();
        playerSpeed = getPlayerSpeed();
        fuelCheck();
        animate(); // Animate Starfield Background 

        // Draw all elements
        bullets.forEach(bullet => {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.closePath();
        });

        drawPlayer();
        drawRedCircle();

        enemies.forEach(enemy => {
            ctx.beginPath();

            // Draw different enemy types based on their color
            if (enemy.color == 1) {
                ctx.drawImage(astroid01, enemy.x - (enemy.radius / 1.1), enemy.y - (enemy.radius / 1.1), enemy.radius * 1.9, enemy.radius * 1.9);
            }
            else if (enemy.color == 2) {
                ctx.drawImage(astroid02, enemy.x - (enemy.radius / 1.1), enemy.y - (enemy.radius / 1.1), enemy.radius * 1.9, enemy.radius * 1.9);
            }
            else if (enemy.color == 3) {
                ctx.drawImage(astroid03, enemy.x - (enemy.radius / 1.1), enemy.y - (enemy.radius / 1.1), enemy.radius * 1.9, enemy.radius * 1.9);
            }
            else if (enemy.color == 4) {
                ctx.drawImage(astroid04, enemy.x - (enemy.radius / 1.1), enemy.y - (enemy.radius / 1.1), enemy.radius * 1.9, enemy.radius * 1.9);
            }
            else if (enemy.color == 5) {
                ctx.drawImage(astroid05, enemy.x - (enemy.radius / 1.1), enemy.y - (enemy.radius / 1.1), enemy.radius * 1.9, enemy.radius * 1.9);
            }
            else if (enemy.color == 6) {
                ctx.drawImage(astroid06, enemy.x - (enemy.radius / 1.1), enemy.y - (enemy.radius / 1.1), enemy.radius * 1.9, enemy.radius * 1.9);
            }

            ctx.fill();
            ctx.closePath();
        });

        fuelItems.forEach(fuelItem => {
            ctx.beginPath();
            ctx.drawImage(fuelCrystal, fuelItem.x - (fuelItem.radius / 1.1), fuelItem.y - (fuelItem.radius / 1.1), fuelItem.radius * 1.9, fuelItem.radius * 1.9);
            ctx.fill();
            ctx.closePath();
        });
    }

    exitPortal();
    drawBorder();
    drawHUD();

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

function checkGamepadButtonPress() {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad) {
        gamepadConnected = true;

        // Start Button (Assuming button index 9 is the 'Start' button)
        if (gamepad.buttons[9].pressed) {
            startGame();
        }

        // Speed Boost (Assuming button index 0 is the 'A' button)
        if (gamepad.buttons[0].pressed && gameStarted) {
            if (!speedBoostActive) {
                console.log('Gamepad "A" button pressed: Activating Speed Boost');
                speedBoostActive = true;
            }
        } else {
            if (speedBoostActive) {
                console.log('Gamepad "A" button released: Deactivating Speed Boost');
                speedBoostActive = false;
            }
        }

        // Super Bomb Activation (Assuming button index 1 is the 'B' button)
        if (gamepad.buttons[1].pressed && gameStarted && superBombItem > 0) {
            console.log('Gamepad "B" button pressed: Activating Super Bomb');
            superBombActivate();
        }
    } else {
        gamepadConnected = false;
    }

    requestAnimationFrame(checkGamepadButtonPress);
}

function initGamepad() {
    // Check if any gamepads are already connected
    const gamepads = navigator.getGamepads();
    if (gamepads && gamepads.length > 0 && gamepads[0]) {
        gamepadConnected = true;
    }

    // Start checking for gamepad input
    checkGamepadButtonPress();
}

// Initialize gamepad input when the page loads
window.addEventListener('load', initGamepad);

initStars();

// Draw Splash Screen once the image is loaded
splashScreen.onload = function () {
    ctx.beginPath();
    ctx.drawImage(splashScreen, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
};

updateGamepadInput();