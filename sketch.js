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

let canvas;
let player;

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
        fill("#792127");

        // Draws the wall patterns
        for (let thisBar = 0; thisBar < WALL_STRIPES + 1; thisBar++) {
            rect(
                (width - WALL_PADDING) * thisWall,
                thisBar * (height / WALL_STRIPES) + cameraY % (height / WALL_STRIPES),
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
    if (player.pos.y - height / 2 < playerScore) {
        cameraY = player.pos.y - height / 2;
        playerScore = -cameraY;

        console.log("New score: " + playerScore);
    }

    pop();

    // Keeps the game canvas centered on the webpage
    // Source: https://editor.p5js.org/jm8785/sketches/r0DMO5Mqj
    canvas.position(
        (windowWidth - DIMENSIONS[0]) / 2,
        (windowHeight - DIMENSIONS[1]) / 2
    );
}