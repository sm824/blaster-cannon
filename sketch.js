/*********************************************************************
Name: Sarah Mckenzie
Date: 2024-05-16
Class: Computer Science 30
Assignment: Final Project
Title: Blaster Cannon - Bane of the Cybirds
Purpose: Runs a game in which the user plays as a cannon able to leap
         from walls, in which they must shoot down cyborg bird enemies

CREDITS: Original music made with https://www.beepbox.co
         Other audio recorded and edited with Audacity
         Main font taken from Google Fonts: https://fonts.google.com/specimen/Orbitron?query=orbitron
         Menu background (media/TitleScreen.jpg) made using Clip Studio Paint
*********************************************************************/
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
let newHideawaySide;

let menuBG;

let menuButtons = {
    playButton: NaN,
    customizeButton: NaN,
    manualButton: NaN,
    loadSavegame: NaN,
    exportSavegame: NaN
};

/**
 * Sets the global mouse click variable to true for 1 frame. This is used
 * by the game buttons to detect clicks
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
    cybirdDiveSound = loadSound("media/BirdAttackSquack.mp3");
    cannonFireSound = loadSound("media/CannonFire.mp3");
    cannonDamageSound = loadSound("media/CannonDamage.mp3");
    cybirdDamageSound = loadSound("media/BirdDamage.mp3");
    healingSound = loadSound("media/Healing.mp3");

    gameSong = loadSound("media/GameSong.mp3");
    gameOutro = loadSound("media/GameOutro.mp3");
}

function keyTyped() {

    // Ensures the player is in the game to use the controls. This
    // prevents the player from being able to jump or fire bullets while
    // customizing their character, and stops keystrokes outside of game-
    // play from causing reference errors
    if (currentGameState == GAMEPLAY_STATES.playing) {

        // 70 = "F" key
        if (keyCode == 70) {
            player.fire();
        }

        // 32 = "Space" key
        else if (keyCode == 32) {
            player.jump();
        }
    }
}

function setup() {
    canvas = createCanvas(...DIMENSIONS);
    currentGameState = GAMEPLAY_STATES.menu;
    highestAdvance = 0;

    fill(SECONDARY_COLOR);  // Sets the color of the game walls
    textFont(gameFont);
    textSize(25 * UI_SCALE);
    angleMode(DEGREES);

    // Resizes the menu background to fit the canvas size
    menuBG.resize(width, height);

    // Loads the menu buttons (used by only menu page)
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
        () => { currentGameState = GAMEPLAY_STATES.displayingManual; },
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

    // Creates the button used to return to the menu (used by various
    // pages excluding menu)
    menuButton = new BlasterCannonButton(
        "Back to\nMenu",
        DEFAULT_MENU_BTN_POS.x, DEFAULT_MENU_BTN_POS.y,
        160, 100,
        returnToMenu,
        18
    );

    // Creates the button used to cancel exiting the game (used by game
    // page)
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
    );

    // Creates the cannon character
    player = new Cannon(
        new p5.Vector(width / 2, height / 2),
    );
}

function draw() {

    console.log("\n\n\n\n\nMenu Button:\n" + menuButton.buttonOperation);

    console.log("gameplayPaused: " + gameplayPaused + "\ngame state: " + currentGameState);

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

        // Displays the high score (highestAdvance)
        textSize(24);
        text(
            "Highest Advance: " + highestAdvance,
            width / 2, 245
        );

        pop();

        // Monitors the buttons
        menuButtons.playButton.monitorButton();
        menuButtons.customizeButton.monitorButton();
        menuButtons.manualButton.monitorButton();
        menuButtons.loadSavegame.monitorButton();
        menuButtons.exportSavegame.monitorButton();
    }

    // If currentGameState is not GAMEPLAY_STATES.menu
    else {

        if (currentGameState == GAMEPLAY_STATES.customizing) {

            background(SECONDARY_COLOR);

            push();
            rectMode(CENTER);

            // Draws the main frame
            fill(THEME_COLOR);
            rect(width / 2, height / 2, width - 80, height - 80, 10);

            // Draws the main interior
            fill("grey");
            rect(width / 2, height / 2, width - 100, height - 100, 10);

            // Draws the cannon character's area
            ellipseMode(CENTER);

            fill(THEME_COLOR);
            circle(width / 2, 600, 425);  // Circle frame

            fill(200);
            circle(width / 2, 600, 400);  // Circle interior

            // Displays text labels near the color pickers
            fill("black");

            text(
                "Cannon body",
                COLOR_PICKER_ALIGN + 110,
                cannonColorPickers.body.position().y + textSize()
            );

            text(
                "Cannon barrel",
                COLOR_PICKER_ALIGN + 110,
                cannonColorPickers.barrel.position().y + textSize()
            );

            text(
                "Cannon base",
                COLOR_PICKER_ALIGN + 110,
                cannonColorPickers.base.position().y + textSize()
            );

            // Keeps the color pickers' position proper
            cannonColorPickers.body.position(window.innerWidth / 2 - COLOR_PICKER_ALIGN, 150);
            cannonColorPickers.barrel.position(window.innerWidth / 2 - COLOR_PICKER_ALIGN, 225);
            cannonColorPickers.base.position(window.innerWidth / 2 - COLOR_PICKER_ALIGN, 300);

            // Applies the entered color to the cannon
            player.colors.body = cannonColorPickers.body.color();
            player.colors.barrel = cannonColorPickers.barrel.color();
            player.colors.base = cannonColorPickers.base.color();

            // Draws the cannon as a preview of its colors
            player.display();

            textAlign(CENTER);
            text("Preview", width / 2, 700);

            // Draws the page title/prompt
            textSize(28);
            text("Click a color to change it", width / 2, 100);

            pop();
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
            textLeading(35);

            text(PLAYER_MANUAL, 80, 120);

            pop();
        }

        else if (currentGameState == GAMEPLAY_STATES.importingSavegame) {
            background(SECONDARY_COLOR);

            push();
            rectMode(CENTER);

            // Draws the page border
            fill(THEME_COLOR);
            rect(
                width / 2, height / 2,
                width - 10, height - 10,
                45
            );

            fill("black");
            rect(
                width / 2, height / 2,
                width - 50, height - 50,
                35
            );

            fill("grey");
            rect(
                width / 2, height / 2,
                width - 60, height - 60,
                35
            );

            fill("black");
            rect(
                width / 2, height / 2,
                width - 75, height - 75,
                35
            );

            pop();

            // Keeps the file picker centered
            savegameFileChooser.position(
                window.innerWidth / 2,
                window.innerHeight / 2,
            );
        }

        // Runs the game if the player is playing it (not the menu or anything else)
        else {

            if (gameplayPaused) {

                // Runs the corrent actions if the player is dead or paused
                if (player.health <= 0) {
                    acknowledgeDeath();
                }
                else {
                    confirmReturnToMenu();
                    cancelMenuButton.monitorButton();
                }
            }

            // If gameplayPaused == false (occurs when the menu button is clicked), run the game
            else {

                background(200);

                // Tracks the cannon position and player's score
                if (player.pos.y - height / 2 < cameraY) {
                    cameraY = player.pos.y - height / 2;
                    playerAdvance = -cameraY;
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

                // Moniters the hideaways
                for (let thisHideaway = 0; thisHideaway < hideaways.length; thisHideaway++) {

                    hideaways[thisHideaway].monitor();

                    // Removes hideaways that have gone off the screen
                    if (hideaways[thisHideaway].pos.y - Hideaway.hideawayHeight / 2 > cameraY + height) {
                        hideaways.splice(thisHideaway, 1);
                    }
                }

                // Determines if an extra life should spawn
                if (random(0, 1800) < 1 && player.health < 5) {
                    extraLives.push(
                        new ExtraLife(new p5.Vector(
                            random(WALL_PADDING + 20, width - WALL_PADDING - 20),
                            cameraY - 1000
                        ))
                    );
                }

                // Monitors the existing extra lives
                for (let thisLife = 0; thisLife < extraLives.length; thisLife++) {
                    extraLives[thisLife].monitor();

                    if (extraLives[thisLife].isOffScreen) {
                        extraLives.splice(thisLife, 1);
                    }
                }

                // Counts down the cybird attack cooldown
                if (Cybird.attackCooldown >= 1) {
                    Cybird.attackCooldown--;
                }

                // Counts down since the last cybird spawn, to prevent too many from spawning at once
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

                // Operates the cybirds on the canvas
                for (let thisBird = 0; thisBird < cybirds.length; thisBird++) {
                    cybirds[thisBird].run();

                    // Checks if any bullets have contacted the current cybird
                    for (let thisBullet = 0; thisBullet < player.bullets.length; thisBullet++) {

                        // Checks if the current bullet has met the current cybird's hitbox
                        if (
                            cybirds[thisBird].state < CYBIRD_STATES.exploding &&
                            player.bullets[thisBullet].pos.x > cybirds[thisBird].pos.x - CYBIRD_HITBOX_SIZE / 2 &&
                            player.bullets[thisBullet].pos.x < cybirds[thisBird].pos.x + CYBIRD_HITBOX_SIZE / 2 &&
                            player.bullets[thisBullet].pos.y > cybirds[thisBird].pos.y - CYBIRD_HITBOX_SIZE / 2 &&
                            player.bullets[thisBullet].pos.y < cybirds[thisBird].pos.y + CYBIRD_HITBOX_SIZE / 2
                        ) {
                            cybirds[thisBird].state = CYBIRD_STATES.exploding;

                            // Runs the actions that must be performed to prepare for the explosion
                            cybirdDamageSound.play();
                            cybirds[thisBird].frame = 0;
                        }
                    }

                    // Deletes the current cybird, if it has left the
                    // screen by over 200 px without detecting the player,
                    // or was shot above by a bullet
                    if (
                        cybirds[thisBird].state == CYBIRD_STATES.patrolling &&
                        cybirds[thisBird].pos.y > cameraY + height + 200 ||
                        cybirds[thisBird].state == CYBIRD_STATES.dead
                    ) {
                        cybirds.splice(thisBird, 1);
                    }
                }

                push();
                translate(0, cameraY);

                // Detects if the player has been killed
                if (player.health <= 0) {
                    gameplayPaused = true;
                    console.log("Game paused by player death");

                    // Places the button in the dialog
                    menuButton.pos.x = width / 2 - menuButton.dimensions.x / 2;
                    menuButton.pos.y = 500;

                    // Alters the button's operation to suit a need
                    // specific to this use
                    menuButton.buttonOperation = () => {
                        pausedMenuOperation();

                        // Changes the high score, if a new on is achieved
                        highestAdvance = Math.floor(Math.max(highestAdvance, playerAdvance));
                    }

                    // Puts a translucent black film on the background
                    background(0, 0, 0, 200);

                    // Plays the game over song
                    gameSong.stop();
                    gameOutro.play();
                }

                // Maintains the player's cannon character, if they are alive
                else {
                    player.operateCannon();

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

                    // Displays the corner text stating the controls
                    textSize(12);
                    text("Press F to fire\nPress space to jump", WALL_PADDING + 8, height - 30);

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
                }

                pop();

                // Determines if another hideaway should spawn, which only occurs while
                // the player is jumping. This prevents an excessive
                // number of hideaways from spawning while the player is
                // stationary
                if (random(HIDEAWAY_RARITY) < 1 && player.isJumping && hideaways.length < 2) {

                    // Forces the side of the new hideaway to be opposite
                    // the side of one that already exists (allows for
                    // only 2 hideaways at any given time, and prevents
                    // any from spawning over each other)
                    while (true) {

                        // Chooses a random side
                        newHideawaySide = [WALL_SIDES.left, WALL_SIDES.right][Math.floor(random(0, 2))];

                        // Breaks from the loop if the side is not occupied
                        if (hideaways.length == 0 || newHideawaySide != hideaways[0].getSide()) {
                            break;
                        }
                    }

                    // Adds the new hideaway in advance
                    hideaways.push(new Hideaway(
                        cameraY - 800,
                        newHideawaySide
                    ));
                }
            }
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