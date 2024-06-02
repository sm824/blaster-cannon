
const SPEED = 5;  // The moving speed of the characters in the game
const WALL_PADDING = 150;  // The thickness in pixels of the side wall
const DIMENSIONS = [800, 920];  // The width and weight of the canvas respectively
const THEME_COLOR = [121, 33, 39];

const CYBIRD_HITBOX_SIZE = 80;
const CYBIRD_ORBIT_RANGE = 250;  // The distance at which the cybirds orbit the player
const CYBIRD_CHASE_DISTANCE = 50;  // This value added to CYBIRD_ORBIT_RANGE makes up the aggro distance in pixels for all cybirds
const CYBIRD_STATES = {
    patrolling: 0,
    chasing: 1,
    orbitting: 2,
    attacking: 3,
    dead: 4
};

let playerAdvance;
let cameraY;
let player;

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
    return Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2);
}
