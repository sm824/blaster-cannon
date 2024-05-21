
const SPEED = 5;

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
