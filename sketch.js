/*********************************************************************
Name: Sarah Mckenzie
Date: 2024-05-16
Class: Computer Science 30
Assignment: Final Project
Title: Blaster Cannon - Bane of the Cybirds
Purpose: Runs a game in which the user plays as a cannon able to leap
         from walls, in which they must shoot down cyborg bird enemies
*********************************************************************/
const DIMENSIONS = [800, 920];
const WALL_PADDING = 150;

let wallAnchors;
let canvas;
let player;

function keyTyped() {
    // 70 = "F" key
    if (keyCode == 70) {
        player.fire();
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

    // Spawns the cannon
    player = new Cannon(
        new p5.Vector(width / 2, height / 2),
        "#B2A79A",
        "#616161"
    );
}

function draw() {
    background(200);

    // Draws the walls
    // Source: https://flexiple.com/javascript/loop-through-object-javascript
    for (let [thisKey, thisWall] of Object.entries(wallAnchors)) {
        rect(
            thisWall.x, thisWall.y,
            WALL_PADDING, DIMENSIONS[1]
        );
    }

    // Maintains the player's cannon character
    player.operateCannon();

    // Keeps the game canvas centered on the webpage
    // Source: https://editor.p5js.org/jm8785/sketches/r0DMO5Mqj
    canvas.position(
        (windowWidth - DIMENSIONS[0]) / 2,
        (windowHeight - DIMENSIONS[1]) / 2
    );
}