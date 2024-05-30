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

const HEALTH_BAR_ROUNDNESS = 10;
const HEALTH_COLORS = [
    "#b6c7d4",
    "#a3a3a3",
    "#c4a991",
    "#d98366",
    "#d63333"
];

let canvas;
let player;
let gameFont;

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
    textSize(25);

    playerScore = 0;
    cameraY = 0;

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
        playerScore = -cameraY;
    }

    // Draws overlays containing the player's stats
    translate(0, -cameraY);

    // Draws the base shapes of the overlays
    fill(...THEME_COLOR, 220);
    rect(0, 0, 300, 100);  // Overlay BG
    fill("grey");
    rect(150, 45, 145, 50);  // Advance value BG

    // Draws the labels and values
    fill("black");
    text("Advance   " + Math.floor(playerScore), 10, 80);  // Advance label and value
    text("Health", 10, 35);  // Health text label

    // Draws the health bar
    rect(120, 10, 175, 25, HEALTH_BAR_ROUNDNESS);  // Health bar BG (empty health)
    fill(HEALTH_COLORS[HEALTH_COLORS.length - player.health]);
    rect(120, 10, 175 / 5 * player.health, 25, HEALTH_BAR_ROUNDNESS);

    // Writes the value of the health bar
    fill("black");
    textSize(15);
    text(player.health + " / 5", 185, 28.5);

    pop();

    // Keeps the game canvas centered on the webpage
    // Source: https://editor.p5js.org/jm8785/sketches/r0DMO5Mqj
    canvas.position(
        (windowWidth - DIMENSIONS[0]) / 2,
        (windowHeight - DIMENSIONS[1]) / 2
    );
}