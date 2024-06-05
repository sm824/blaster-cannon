
const SPEED = 5;  // The moving speed of the characters in the game
const WALL_PADDING = 150;  // The thickness in pixels of the side wall
const DIMENSIONS = [800, 920];  // The width and weight of the canvas respectively
const THEME_COLOR = [121, 33, 39];
const SECONDARY_COLOR = [88, 97, 97];
const BUTTON_BORDER_PADDING = 15;
const GAME_TITLE_Y = 800;

// Source (how to create multi-line strings in JS) : https://eranstiller.com/javascript-multiline-strings#:~:text=You%20can%20use%20single%20quotes,dealing%20with%20longer%20text%20blocks.
const PLAYER_MANUAL = '--- Game Controls ---\
F Key:     Fire a bullet in the direction you face. there is a small\
           cooldown between firings\
Space Bar: Jump in the direction you face. This is the cannon\'s\
           one form of travelling. You will automatically come to a\
           rest upon contact with the opposite wall\
\
--- Objective Instructions ---\
When the game begins, your cannon character will fly towards a\
random side of the hallway. Your goal in the game is to advance as\
far as possible upwards, deeper into the nest of the Cybirds. This\
value, which functions as a score, is called "Advance", and can be\
found in the top left corner of the screen during gameplay. The\
Cybirds, however, will quickly start to come down the hall after\
you in defence of their nest. They will circle and attack you,\
whether you are in motion or stationary, and you must fire bullets\
at them to defeat them. A single hit will destroy them, but they\
are many in number';

const CYBIRD_HITBOX_SIZE = 80;
const CYBIRD_ORBIT_RANGE = 250;  // The distance at which the cybirds orbit the player
const CYBIRD_CHASE_DISTANCE = 50;  // This value added to CYBIRD_ORBIT_RANGE makes up the aggro distance in pixels for all cybirds
const MIN_CYBIRD_SPAWN_INTERVAL = 480;
const CYBIRD_ATTACK_PROBABILITY = 1;  // Higher values = more frequent attacks
const CYBIRD_STATES = {
    patrolling: 0,
    chasing: 1,
    orbitting: 2,
    fleeing: 3,
    attacking: 4,
    dead: 5
};
const GAMEPLAY_STATES = {
    playing: 0,
    menu: 1,
    customizing: 2,
    displayingManual: 3,
    loadingSavegame: 4,
    exportingSavegame: 5
};

DAMAGE_SCREEN_TIME = 45;  // Controls how many frames after taking damage the screen fades red

let playerAdvance;
let cameraY;
let player;
let cybirds;
let cybirdSpawnBlock;  // Controls the initial minumum frames that pass after a cybird flock spawns before more can spawn
let currentGameState;  // Tracks if the player is viewing the menu, customize screen, or playing the game

// Global audio media
let cybirdDive;
let cannonFire;
let cannonDamage;
let cybirdDamage;

let gameSong;

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
 * Sets up global variables and other components required for the
 * game to play
 */
function playGame() {

    currentGameState = GAMEPLAY_STATES.playing;

    // Sets the initial values for required gameplay variables
    playerAdvance = 0;
    cameraY = 0;
    cybirds = [];
    cybirdSpawnBlock = 300;

    // Spawns the cannon
    player = new Cannon(
        new p5.Vector(width / 2, height / 2),
        "#B2A79A",
        "#616161"
    );

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
}

/**
 * Runs the set-up instructions for the page that displays info on
 * how the game is played
 */
function displayManual() {
    currentGameState = GAMEPLAY_STATES.displayingManual;
}

/**
 * Sets up the program to load a JSON file
 */
function loadSavegame() {
    currentGameState = GAMEPLAY_STATES.loadingSavegame;
}

/**
 * Sets up the program to export a savegame JSON file
 */
function exportSavegame() {
    currentGameState = GAMEPLAY_STATES.exportingSavegame;
}
