/*********************************************************************
Name: Sarah Mckenzie
Date: 2024-05-16
Class: Computer Science 30
Assignment: Final Project
Title: Blaster Cannon - Bane of the Cybirds
Purpose: Runs a game in which the user plays as a cannon able to leap
         from walls, in which they must shoot down cyborg bird enemies
*********************************************************************/
DIMENSIONS = [800, 920];

let canvas;

function setup() {
    canvas = createCanvas(...DIMENSIONS);

    console.log("Hello world!");
}

function draw() {
    background(220);

    // Keeps the game canvas centered on the webpage
    // Source: https://editor.p5js.org/jm8785/sketches/r0DMO5Mqj
    canvas.position(
        (windowWidth - DIMENSIONS[0]) / 2,
        (windowHeight - DIMENSIONS[1]) / 2
    );
}