/*********************************************************************
Name: Sarah Mckenzie
Date: 2024-05-16
Class: Computer Science 30
Assignment: Final Project
Title: Blaster Cannon - Bane of the Cybirds
Purpose: Runs a game in which the user plays as a cannon able to leap
         from walls, in which they must shoot down cyborg bird enemies

CREDITS: Original music made with https://www.beepbox.co - https://www.beepbox.co/#9n31sbk0l00e0jt2Qa7g0jj07r1i0o452T7v1u70f40p61770q72f5q0E21990l65d06HT-SRJJJJIAAAAAh0IaE1c11T7v2u71f50p61770q72d42g3q0F21a90k762d06HT-SRJJJJIAAAAAh0IaE1c11T1v1uebf0q8y10ob23d08A9F6B9Q0681Pd756E3b862c632T4v2uf0f0q011z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00E0b000000054AcigM004AcigRpU4AcigN934Ac0000000000x4h008h4gp246KrQvF99x4Amlhioh74LjnXwBZ1uHGuKLSg1f7MyCzQhjhZ99dvFli5darnYWhFbrGAaqtXE2hR6GKCDm3F8AJKGgFFTKaJwzE8QOY5d1yX1BPzVczS8aAzjpvcU_A3gHieAzGCL1At170Ml97iVILF7Wq_xhhhhhhhx55555556o555555564kkkkkkkjbjhYCngnV2CnHzkCzUjnUgIQpS4Qp6jd5RlApcQllmhAPhllp6jd5jFQRU2nFGi4Ow41l8kw0
         Other audio recorded with Audacity
         Main font taken from Google Fonts: https://fonts.google.com/specimen/Orbitron?query=orbitron
         Menu background (media/TitleScreen.jpg) made using Clip Studio Paint
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

let menuBG;

let menuButtons = {
    playButton: NaN,
    customizeButton: NaN,
    manualButton: NaN,
    loadSavegame: NaN,
    exportSavegame: NaN
};

/**
 * Sets the global mouse click variable to true for 1
 * frame. This is used by the game buttons to detect clicks
 */
function mousePressed() {
    mouseIsPressedOnce = true;
}

function preload() {
    // Font Source: https://fonts.google.com/specimen/Orbitron?preview.text=Health
    gameFont = loadFont("media/OrbitronFont.ttf");

    // Loads the menu background image
    menuBG = loadImage("media/TitleScreenBG.jpg");

    // Loads sound media
    cybirdDive = loadSound("media/BirdAttackSquack.mp3");
    cannonFire = loadSound("media/CannonFire.mp3");
    cannonDamage = loadSound("media/CannonDamage.mp3");
    cybirdDamage = loadSound("media/BirdDamage.mp3");

    gameSong = loadSound("media/GameSong.mp3");
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
    currentGameState = GAMEPLAY_STATES.menu;

    fill(SECONDARY_COLOR);  // Sets the color of the game walls
    textFont(gameFont);
    textSize(25 * UI_SCALE);

    // Resizes the menu background to fit the canvas size
    menuBG.resize(width, height);

    // Loads the menu buttons
    menuButtons.playButton = new BlasterCannonButton(
        "Play Game",
        30, 30,
        405, 100,
        playGame,
        24
    );

    menuButtons.customizeButton = new BlasterCannonButton(
        "Customize\nCannon",
        625, 30,
        160, 100,
        customizeCannon,
        18
    );

    menuButtons.manualButton = new BlasterCannonButton(
        "How to Play",
        450, 30,
        160, 100,
        displayManual,
        18
    );

    menuButtons.loadSavegame = new BlasterCannonButton(
        "Load Savegame",
        160, 150,
        230, 60,
        loadSavegame,
        18
    );

    menuButtons.exportSavegame = new BlasterCannonButton(
        "Export Savegame",
        410, 150,
        230, 60,
        exportSavegame,
        18
    );

    // Creates the button used to return to the menu from various pages
    menuButton = new BlasterCannonButton(
        "Back to\nMenu",
        DEFAULT_MENU_BTN_POS.x, DEFAULT_MENU_BTN_POS.y,
        160, 100,
        returnToMenu,
        18
    );

    // Creates the button used to cancel exiting the game
    cancelMenuButton = new BlasterCannonButton(
        "Cancel",
        405, height / 2 + 50,
        160, 100,
        () => {
            menuButton.pos = DEFAULT_MENU_BTN_POS.copy();
            menuButton.buttonOperation = returnToMenu;
            gameplayPaused = false;
        },
        18
    )
}

function draw() {

    if (currentGameState == GAMEPLAY_STATES.menu) {

        // Draws the title screen background
        image(menuBG, 0, 0, menuBG.width, menuBG.height);

        // Draws the background for the game title
        push();

        rectMode(CENTER);
        noStroke();
        fill(0, 0, 0, 175);
        rect(
            width / 2,
            GAME_TITLE_Y - 25,
            750,
            100,
            60
        );

        // Draws the game title
        textSize(80);
        fill(THEME_COLOR);
        textAlign(CENTER);

        text(  // Main title
            "Blaster Cannon",
            width / 2, GAME_TITLE_Y
        );

        fill("white");
        textSize(18);

        text(  // Sub title
            "Bane of the Cybirds",
            width / 2, GAME_TITLE_Y + 50
        );

        pop();

        // Monitors the buttons
        menuButtons.playButton.monitorButton();
        menuButtons.customizeButton.monitorButton();
        menuButtons.manualButton.monitorButton();
        menuButtons.loadSavegame.monitorButton();
        menuButtons.exportSavegame.monitorButton();
    }

    else if (currentGameState == GAMEPLAY_STATES.customizing) {
        //
    }

    else if (currentGameState == GAMEPLAY_STATES.displayingManual) {

        push();
        rectMode(CENTER);

        // Draws the manual background
        background(SECONDARY_COLOR);

        // Draws the frame
        fill(THEME_COLOR);
        rect(
            width / 2,
            height / 2,
            width - 80,
            height - 80,
            90
        );

        // Fills the interior of the frame
        fill("grey");
        rect(
            width / 2,
            height / 2,
            width - 100,
            height - 100,
            80
        );

        // Writes the manual text
        fill("black");
        textSize(18);
        textLeading(40);

        text(PLAYER_MANUAL, 80, 120);

        pop();

        // Monitors the return-to-menu button
        menuButton.monitorButton();
    }

    else if (currentGameState == GAMEPLAY_STATES.loadingSavegame) {
        //
    }

    else if (currentGameState == GAMEPLAY_STATES.exportingSavegame) {
        //
    }

    // Runs the game if the player is playing it (not the menu or anything else)
    else {

        if (gameplayPaused) {
            confirmReturnToMenu();
            cancelMenuButton.monitorButton();
        }

        // If gameplayPaused == false (occurs when the menu button is clicked), run the game
        else {

            background(200);

            if (Cybird.attackCooldown >= 1) {
                Cybird.attackCooldown--;
            }

            // Counts down since the last cybird spawn, to prevent
            if (cybirdSpawnBlock > 0) {
                cybirdSpawnBlock--;
            }

            // Determines if more cybirds should spawn
            if (cybirdSpawnBlock == 0 && random(600 / CYBIRD_SPAWN_FACTOR) < playerAdvance / 1000) {

                cybirdSpawnBlock = Math.floor(MIN_CYBIRD_SPAWN_INTERVAL / (playerAdvance / 5000 + 1));

                // Determines how many cybirds should spawn in the new flock, at randomized location
                for (let newBird = 0; newBird < random(1, 4); newBird++) {
                    cybirds.push(new Cybird(new p5.Vector(
                        random(WALL_PADDING + CYBIRD_WALL_DISTANCE, width - WALL_PADDING - CYBIRD_WALL_DISTANCE),
                        random(CYBIRD_ADVANCE_Y) - CYBIRD_SPAWN_Y_VARIANCE + cameraY * 1.5 + random(CYBIRD_SPAWN_Y_VARIANCE)
                    )));
                }
            }

            let tempBirdCount = 0;

            // Operates the cybirds on the canvas
            for (let thisBird = 0; thisBird < cybirds.length; thisBird++) {
                cybirds[thisBird].run();

                if (cybirds[thisBird].pos.y < cameraY + height &&
                    cybirds[thisBird].pos.y > cameraY
                ) {
                    tempBirdCount++;
                }

                for (let thisBullet = 0; thisBullet < player.bullets.length; thisBullet++) {

                    // Checks if the current bullet has met the cuurrent cybird's hitbox
                    if (player.bullets[thisBullet].pos.x > cybirds[thisBird].pos.x - CYBIRD_HITBOX_SIZE / 2 &&
                        player.bullets[thisBullet].pos.x < cybirds[thisBird].pos.x + CYBIRD_HITBOX_SIZE / 2 &&
                        player.bullets[thisBullet].pos.y > cybirds[thisBird].pos.y - CYBIRD_HITBOX_SIZE / 2 &&
                        player.bullets[thisBullet].pos.y < cybirds[thisBird].pos.y + CYBIRD_HITBOX_SIZE / 2
                    ) {
                        cybirds[thisBird].state = CYBIRD_STATES.dead;  // State 4 marks the cybird as dead
                        cybirdDamage.play();  // This must be played here, because the cybird object just killed will be destroyed before the sound can play from it
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
                    (280 * UI_SCALE) / 60 * player.bulletCooldown,
                    20 * UI_SCALE,
                    HEALTH_BAR_ROUNDNESS * UI_SCALE
                );
            }

            pop();
        }

        // Monitors the return-to-menu button
        menuButton.monitorButton();
    }

    // Keeps the game canvas centered on the webpage
    // Source: https://editor.p5js.org/jm8785/sketches/r0DMO5Mqj
    canvas.position(
        (windowWidth - DIMENSIONS[0]) / 2,
        (windowHeight - DIMENSIONS[1]) / 2
    );

    mouseIsPressedOnce = false;  // Resets the single-click mouse detection variable
}