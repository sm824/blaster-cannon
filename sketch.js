/*********************************************************************
Name: Sarah Mckenzie
Date: 2024-05-16
Class: Computer Science 30
Assignment: Final Project
Title: Blaster Cannon - Bane of the Cybirds
Purpose: Runs a game in which the user plays as a cannon able to leap
         from walls, in which they must shoot down cyborg bird enemies
*********************************************************************/
const WALL_STRIPES = 10;
const CYBIRD_ADVANCE_Y = -800;  // How far (pixels) the cybirds spawn ahead
const CYBIRD_WALL_DISTANCE = 50;  // The minumum distance a cybird in the hall must be from the wall (before it comes to a player)
const CYBIRD_SPAWN_FACTOR = 1;  // A factor to control the spawn of cybirds. Higher values = more cybirds overall
const CYBIRD_SPAWN_Y_VARIANCE = 75;  // Controls the maximum staggering distance of individuals in a cybird flock

const UI_SCALE = 1;
const HEALTH_BAR_ROUNDNESS = 10;
const HEALTH_COLORS = [
    "#b6c7d4",
    "#a3a3a3",
    "#c4a991",
    "#d98366",
    "#d63333"
];

let canvas;
let gameFont;
let cybirds;

function preload() {
    // Font Source: https://fonts.google.com/specimen/Orbitron?preview.text=Health
    gameFont = loadFont("media/OrbitronFont.ttf");
}

function keyTyped() {
    // 70 = "F" key
    if (keyCode == 70) {
        player.fire();
    }

    // 32 = "Space" key
    else if (keyCode == 32) {
        player.jump();
    }
}

function setup() {
    canvas = createCanvas(...DIMENSIONS);

    // Calculates the positions (which lie in the top left of the rect) of each wall
    wallAnchors = {
        left: new p5.Vector(0, 0),
        right: new p5.Vector(DIMENSIONS[0] - WALL_PADDING, 0)
    };

    fill("#586161");
    textFont(gameFont);
    textSize(25 * UI_SCALE);

    playerAdvance = 0;
    cameraY = 0;
    cybirds = [];

    // Spawns the cannon
    player = new Cannon(
        new p5.Vector(width / 2, height / 2),
        "#B2A79A",
        "#616161"
    );

    // Sends the player to one side horizontally, chosen randomly
    player.jumpingAngle = [90, 270][Math.floor(random(0, 2))];
    player.isJumping = true;
}

function draw() {
    background(200);

    // Determines if more cybirds should spawn
    if (random(600 / CYBIRD_SPAWN_FACTOR) < playerAdvance / 1000) {

        // Determines how many cybirds should spawn in the new flock, at randomized location
        for (let newBird = 0; newBird < random(1, 4); newBird++) {
            cybirds.push(new Cybird(new p5.Vector(
                random(WALL_PADDING + CYBIRD_WALL_DISTANCE, width - WALL_PADDING - CYBIRD_WALL_DISTANCE),
                random(CYBIRD_ADVANCE_Y) - CYBIRD_SPAWN_Y_VARIANCE + cameraY * 1.5 + random(CYBIRD_SPAWN_Y_VARIANCE)
            )));
        }
    }

    // Operates the cybirds on the canvas
    for (let thisBird = 0; thisBird < cybirds.length; thisBird++) {
        cybirds[thisBird].run();

        for (let thisBullet = 0; thisBullet < player.bullets.length; thisBullet++) {
            
            // Checks if the current bullet has met the cuurrent cybird's hitbox
            if (player.bullets[thisBullet].pos.x > cybirds[thisBird].pos.x - CYBIRD_HITBOX_SIZE / 2 &&
                player.bullets[thisBullet].pos.x < cybirds[thisBird].pos.x + CYBIRD_HITBOX_SIZE / 2 &&
                player.bullets[thisBullet].pos.y > cybirds[thisBird].pos.y - CYBIRD_HITBOX_SIZE / 2 &&
                player.bullets[thisBullet].pos.y < cybirds[thisBird].pos.y + CYBIRD_HITBOX_SIZE / 2
            ) {
                cybirds[thisBird].state = CYBIRD_STATES.dead;  // State 4 marks the cybird as dead
            }
        }
    }

    // Checks for cybirds that were shot above, and deletes them (prevents errors that would occur if they were deleted above)
    for (let thisBird = 0; thisBird < cybirds.length; thisBird++) {
        if (cybirds[thisBird].state == CYBIRD_STATES.dead) {
            cybirds.splice(thisBird, 1);
        }
    }

    // Draws the walls (right, then left)
    for (let thisWall = 0; thisWall < 2; thisWall++) {

        // Base walls
        rect(
            (width - WALL_PADDING) * thisWall,
            0,
            WALL_PADDING,
            height
        );

        push();
        fill(THEME_COLOR);

        // Draws the wall patterns
        for (let thisBar = 0; thisBar < WALL_STRIPES + 1; thisBar++) {
            rect(
                (width - WALL_PADDING) * thisWall,
                height - (thisBar * (height / WALL_STRIPES) + cameraY % (height / WALL_STRIPES)),
                WALL_PADDING,
                10
            );
        }

        pop();
    }

    push();
    translate(0, cameraY);

    // Maintains the player's cannon character
    player.operateCannon();

    // Tracks the cannon position and player's score
    if (player.pos.y - height / 2 < cameraY) {
        cameraY = player.pos.y - height / 2;
        playerAdvance = -cameraY;
    }

    // Draws overlays containing the player's stats
    translate(0, -cameraY);

    // Draws the base shapes of the overlays
    fill(...THEME_COLOR, 220);
    rect(0, 0, 300 * UI_SCALE, 135 * UI_SCALE);  // Overlay background
    fill("grey");

    // Draws the advance value background
    rect(
        150 * UI_SCALE,
        45 * UI_SCALE,
        145 * UI_SCALE,
        50 * UI_SCALE
    );

    // Draws the labels and values
    fill("black");
    text("Advance   " + Math.floor(playerAdvance), 10 * UI_SCALE, 80 * UI_SCALE);  // Advance label and value
    text("Health", 10 * UI_SCALE, 35 * UI_SCALE);  // Health text label

    // Health bar background (empty health)
    rect(
        120 * UI_SCALE,
        10 * UI_SCALE,
        175 * UI_SCALE,
        25 * UI_SCALE,
        HEALTH_BAR_ROUNDNESS * UI_SCALE
    );

    // Cooldown bar background
    rect(
        10 * UI_SCALE,
        105 * UI_SCALE,
        280 * UI_SCALE,
        20 * UI_SCALE,
        HEALTH_BAR_ROUNDNESS * UI_SCALE
    );

    // Health bar full area
    fill(HEALTH_COLORS[HEALTH_COLORS.length - player.health]);  // Sets the health bar to a color based off its value
    rect(
        120 * UI_SCALE,
        10 * UI_SCALE,
        175 / 5 * player.health * UI_SCALE,
        25 * UI_SCALE,
        HEALTH_BAR_ROUNDNESS * UI_SCALE
    );

    // Writes the value of the health bar
    fill(THEME_COLOR);
    textSize(15 * UI_SCALE);
    text(player.health + " / 5", 185 * UI_SCALE, 28.5 * UI_SCALE);

    // Draws the fill of the cooldown bar
    if (player.bulletCooldown > 0) {
        rect(
            10 * UI_SCALE,
            105 * UI_SCALE,
            (280 * UI_SCALE)/60 * player.bulletCooldown,
            20 * UI_SCALE,
            HEALTH_BAR_ROUNDNESS * UI_SCALE
        );
    }

    pop();

    // Keeps the game canvas centered on the webpage
    // Source: https://editor.p5js.org/jm8785/sketches/r0DMO5Mqj
    canvas.position(
        (windowWidth - DIMENSIONS[0]) / 2,
        (windowHeight - DIMENSIONS[1]) / 2
    );
}