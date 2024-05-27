
const SPEED = 5;  // The moving speed of the characters in the game
const WALL_PADDING = 150;  // The thickness in pixels of the side wall
const DIMENSIONS = [800, 920];  // The width and weight of the canvas respectively

let playerScore;
let cameraY;

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
    return y - 2*cameraY;
}
