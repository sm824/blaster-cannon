
const SPEED = 5;  // The moving speed of the characters in the game
const WALL_PADDING = 150;  // The thickness in pixels of the side wall
const DIMENSIONS = [800, 920];  // The width and weight of the canvas respectively

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
