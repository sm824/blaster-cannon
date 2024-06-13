
const SPEED = 5;  // The moving speed of the characters in the game
const WALL_PADDING = 150;  // The thickness in pixels of the side wall
const DIMENSIONS = [800, 920];  // The width and weight of the canvas respectively
const THEME_COLOR = [121, 33, 39];
const SECONDARY_COLOR = [88, 97, 97];
const BUTTON_BORDER_PADDING = 15;
const GAME_TITLE_Y = 800;
const DEFAULT_MENU_BTN_POS = new p5.Vector(600, 30);
const HIDEAWAY_RARITY = 800;

// Source (how to create multi-line strings in JS): https://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript
const PLAYER_MANUAL = `--- Game Controls ---
F Key:     Fire a bullet in the direction you face. there is a small
           cooldown between firings
Space Bar: Jump in the direction you face. This is the cannon's
           one form of travelling. You will automatically come to a
           rest upon contact with the opposite wall

--- Objective Instructions ---
When the game begins, your cannon character will fly towards a
random side of the hallway. Your goal in the game is to advance as
far as possible upwards, deeper into the nest of the Cybirds. This
value, which functions as a score, is called "Advance", and can be
found in the top left corner of the screen during gameplay. The
Cybirds, however, will quickly start to come down the hall after
you in defence of their nest. They will circle and attack you,
whether you are in motion or stationary, and you must fire bullets
at them to defeat them. Extra lives will float down the hallway
during gameplay, and to heal you must shoot them.
All it takes is a single hit to destroy them, but they are many in
number, so beware!`;

const EXTRA_LIFE_SIZE = 0.75;
const WALL_STRIPES = 10;  // The number of stripes on each wall

const CYBIRD_HITBOX_SIZE = 80;
const CYBIRD_ORBIT_RANGE = 250;  // The distance at which the cybirds orbit the player
const CYBIRD_CHASE_DISTANCE = 50;  // This value added to CYBIRD_ORBIT_RANGE makes up the aggro distance in pixels for all cybirds
const MIN_CYBIRD_SPAWN_INTERVAL = 480;
const CYBIRD_EXPLOSION_DURATION = 50;
const CYBIRD_ATTACK_PROBABILITY = 1;  // Higher values = more frequent attacks
const CYBIRD_STATES = {
    patrolling: 0,
    chasing: 1,
    orbitting: 2,
    fleeing: 3,
    attacking: 4,
    exploding: 5,
    dead: 6
};
const GAMEPLAY_STATES = {
    playing: 0,
    menu: 1,
    customizing: 2,
    displayingManual: 3,
};
const WALL_SIDES = {
    left: -1,
    right: 1
};

DAMAGE_SCREEN_TIME = 45;  // Controls how many frames after taking damage the screen fades red

let playerAdvance;
let highestAdvance;
let cameraY;
let player;
let extraLives;
let hideaways;
let cybirds;
let cybirdSpawnBlock;  // Controls the initial minumum frames that pass after a cybird flock spawns before more can spawn
let currentGameState;  // Tracks if the player is viewing the menu, customizing their character, or playing the game

let gameplayPaused = false;
let cancelMenuButton;
let menuButton;
let mouseIsPressedOnce = false;  // Tracks a mouse click for 1 frame (needed since built-in mouseIsPressed stays true when the click is held)

// Cannon character color customization variables
const DEFAULT_CANNON_COLORS = {
    body: [178, 167, 154],
    barrel: [97, 97, 97],
    base: [128, 128, 128]
};
const COLOR_PICKER_ALIGN = 240;
const COLOR_PICKER_DIMENSIONS = [100, 50];
let cannonColorPickers = { body: NaN, barrel: NaN, base: NaN };

// Global audio media
let cybirdDiveSound;
let cannonFireSound;
let cannonDamageSound;
let cybirdDamageSound;
let healingSound;

let gameSong;
let gameOutro;

/**
     * Moves the position a distance, by the number of pixels
     * given, in the direction of the fiven angle (degreed)
     *
     * pos = the position (a p5.Vector object) being changed
     * distance = the distance in pixels which the bullet
     *            moves
     * angle = the angle used to determine the direction
     *         (in degrees)
     */
function advance(pos, distance, angle) {
    // Offsets the angle by 90, and converts it to radians
    pos.x +=
        distance * Math.cos((angle + 90) * (PI / 180));
    pos.y +=
        distance * Math.sin((angle + 90) * (PI / 180));
}

/**
 * Uses cameraY to translates the canvas backwards, to a position from
 * which shapes that would otherwise be off-screen can appear onscreen as
 * an illusion while retaining their true positions. This function should
 * typically be used alongside push() and pop(), as it does not translate
 * back afterwards
 */
function translateToScreen() {
    translate(
        0,
        -(2 * cameraY)
    );
}

/**
 * Used cameraY to alter a given y value so it would appear to be on the
 * screen at the height the game is mimicking on the canvas
 * 
 * y = the Y axis position that is being altered to appear on-screen
 */
function adaptHeightToScreen(y) {
    return y - 2 * cameraY;
}

/**
 * Returns an angle in degrees that the object at the position anchorPos
 * must point to face the position targetPos
 * 
 * anchorPos = the p5.Vector position that the returned angle can be
 *             applied to for it to point towards the targetPos
 * targetPos = the p5.Vector position that the returned angle will point
 *             the target object towards
 */
function aim(anchorPos, targetPos) {
    let rotation =
        Math.atan((targetPos.y - anchorPos.y) / (targetPos.x - anchorPos.x)) / (PI / 180) + 90;

    if (targetPos.x >= anchorPos.x) {
        rotation += 180;
    }

    return rotation;
}

/**
 * Returns the distance in pixels between the 2 location given
 * 
 * pos1 = one p5.Vector object, to mark one end of the distance
 * pos2 = a second p5.Vector object, to mark the second end of the
 *        distance
 */
function getDistance(pos1, pos2) {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
}

/**
 * Coverts an unit RGB color (values 0-1) into a standard RGB color (0-255)
 * Note that the color must be given as an array order red, green, blue,
 * NOT a color object
 * 
 * arrayRGB = the array of 0-1 primary color values which is to be changed
 *            into an array of 0-255 color values
 */
function convertUnitRGBToStandard(arrayRGB) {

    // Multiplies the red, green, and blue values by 255
    for (let thisValue = 0; thisValue < arrayRGB.length; thisValue++) {
        arrayRGB[thisValue] *= 255;
    }

    return arrayRGB;
}

/**
 * Sets up global variables and other components required for the
 * game to play
 */
function playGame() {

    player.health = 5;
    player.pos.x = width / 2;
    player.pos.y = height / 2;
    player.damageScreenTimer = 0;

    currentGameState = GAMEPLAY_STATES.playing;

    // Sets the initial values for required gameplay variables
    playerAdvance = 0;
    cameraY = 0;
    extraLives = [];
    cybirds = [];
    hideaways = [];
    cybirdSpawnBlock = 300;

    // Sends the player to one side horizontally, chosen randomly
    player.jumpingAngle = [90, 270][Math.floor(random(0, 2))];
    player.isJumping = true;

    gameSong.loop();
}

/**
 * Runs the initial commands to set up the cannon customization
 * page
 */
function customizeCannon() {
    currentGameState = GAMEPLAY_STATES.customizing;

    // Makes the cannon render in the center of the preview circle
    cameraY = 0;
    player.pos.x = width / 2;
    player.pos.y = 600;
    player.rotation = 180;
    player.isVisible = true;

    // creates color-pickers (used by cannon customization page)
    cannonColorPickers.body = createColorPicker(color(player.colors.body));
    cannonColorPickers.barrel = createColorPicker(color(player.colors.barrel));
    cannonColorPickers.base = createColorPicker(color(player.colors.base));

    // Sizes the color pickers
    cannonColorPickers.body.size(...COLOR_PICKER_DIMENSIONS);
    cannonColorPickers.barrel.size(...COLOR_PICKER_DIMENSIONS);
    cannonColorPickers.base.size(...COLOR_PICKER_DIMENSIONS);

    // Sets the menu button to clean up the colorpickers in addition to
    // its usual processes, then set its operation back to the general
    // requirements
    menuButton.buttonOperation = () => {

        // Discards of the color pickers when the page is left
        // Source (for removing p5.Elements): https://www.w3schools.com/jsref/met_element_remove.asp
        cannonColorPickers.body.remove();
        cannonColorPickers.barrel.remove();
        cannonColorPickers.base.remove();

        returnToMenu();
        menuButton.buttonOperation = returnToMenu;
    };
}

/**
 * Sets up the program to load a JSON file
 */
function loadSavegame() {
    //
}

/**
 * Exports a savegame as a JSON file, which can be loaded into the game
 * 
 */
function exportSavegame() {

    let savegameObject = {
        "playerColors": player.colors,
        "highestAdvance": highestAdvance
    };

    // Ensures the player's colors are formatted as RGB arrays out of 255
    if (!Array.isArray(player.colors.body)) {

        // Retrieves the array part of the color objects
        savegameObject.playerColors.body = savegameObject.playerColors.body._array;
        savegameObject.playerColors.barrel = savegameObject.playerColors.barrel._array;
        savegameObject.playerColors.base = savegameObject.playerColors.base._array;

        // Removes the opacity value from the end
        savegameObject.playerColors.body.splice(3, 1);
        savegameObject.playerColors.barrel.splice(3, 1);
        savegameObject.playerColors.base.splice(3, 1);

        // Converts the 0-1 values to 0-255
        convertUnitRGBToStandard(savegameObject.playerColors.body);
        convertUnitRGBToStandard(savegameObject.playerColors.barrel);
        convertUnitRGBToStandard(savegameObject.playerColors.base);
    }

    // Exports the savegame
    saveJSON(
        savegameObject,
        "blasterCannonSavegame.json",
        true
    );
}

/**
 * Sends the player back to the menu
 */
function returnToMenu() {

    // If the player has clicked the menu button from the game, move the
    // button onto the confirmation dialog
    if (currentGameState == GAMEPLAY_STATES.playing && !gameplayPaused) {
        gameplayPaused = true;
        menuButton.pos.x = width / 2 - 165;
        menuButton.pos.y = height / 2 + 50;

        // Sets the menuButton to perform special operations specific to
        // exiting gameplay
        menuButton.buttonOperation = () => {
            pausedMenuOperation();

            // Resets and stops the gameplay song
            gameSong.stop();
        };

        return;  // Stops the function call early
    }

    currentGameState = GAMEPLAY_STATES.menu;
}

/**
 * Runs a dialog box that informs the player their progress will be lost
 * to return now, and confirms they want to quit anyway.
 * Note: Must be run in a loop
 */
function confirmReturnToMenu() {

    // Draws the dialog background
    push();

    rectMode(CENTER);

    fill(THEME_COLOR);
    rect(width / 2, height / 2, 400, 500, 25);  // Frame

    fill("grey");
    rect(width / 2, height / 2, 380, 480, 25);  // Interior BG

    // Draws the decorative bars (top then bottom)
    fill(THEME_COLOR);
    for (let thisBar = WALL_SIDES.left; thisBar <= WALL_SIDES.right; thisBar += 2) {
        rect(
            width / 2,
            height / 2 + 260 * thisBar,
            300,
            10,
            10
        );
    }

    // Writes the text asking if the user wants to proceed
    fill("black");
    textAlign(CENTER);

    textSize(24);
    text("Do you want to exit to the\nmain menu?\n", width / 2, height / 2 - 100);

    textSize(16);
    text("You will lose your progress if you\nleave before the game is over", width / 2, height / 2 - 30);

    pop();
}

/**
 * Runs in a loop after the player is killed in gameplay, to inform them
 * they have been killed as well as if they have beat their high score
 */
function acknowledgeDeath() {

    push();

    rectMode(CENTER);

    // Draws the outer frames
    fill(SECONDARY_COLOR);
    square(width / 2, height / 2, 360, 90);

    fill("black");
    square(width / 2, height / 2, 350, 90);

    fill(THEME_COLOR);
    square(width / 2, height / 2, 330, 80);

    fill("grey");
    square(width / 2, height / 2, 300, 70);

    // Displays the messages informing the player of their death
    textAlign(CENTER);
    fill("black");

    // Dialog title
    textSize(30);
    text("Game Over", width / 2, 355);

    // Draws the underline
    fill(THEME_COLOR);
    rect(width / 2, 365, 215, 5, 5);

    // Dialog info
    fill("black");

    textSize(18);
    text("Advance: " + Math.floor(playerAdvance), width / 2, 390);
    text("Highest Advance: " + highestAdvance, width / 2, 420);

    textSize(16);
    // Determines what message to give the player about their advance score
    if (playerAdvance > highestAdvance) {
        text("You exceeded your previous\nhighest advance!", width / 2, 460);
    } else {
        text("Your advance was lower than\nyour highest-ever. Better luck\nnext time.", width / 2, 460);
    }

    pop();

    // Monitors the menu button
    menuButton.monitorButton();
}

/**
 * holds the commands that must be executed by the menu button while the
 * gameplay is paused, and runs additional tasks given as the argument
 */
function pausedMenuOperation() {

    // Calls the original button operation
    returnToMenu();

    // Resets the GUI
    menuButton.buttonOperation = returnToMenu;
    menuButton.pos = DEFAULT_MENU_BTN_POS.copy();
    gameplayPaused = false;

}
