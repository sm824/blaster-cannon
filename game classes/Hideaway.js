/*********************************************************************
The class for the rectangular hideaways that spawn in the side of the
hallway. When objects of this class have gone off the screen, a
property called .isOffScreen will be set to true. This must be used at
some place other than Object.monitor() to delete the objects.
Object.drawShadow() draws the shadow over the displayed portion of the
object, and is called seperately from Object.monitor()

Note: Object.monitor() for these objects must be called before the
      main monitoring function for the Cannon, Bullets, and Cybirds so
      they are displayed overtop of the Hideaway objects and remain
      visible.
      Object.drawShadow() must be called AFTER the display of the objects
      listed above, so they too will appear shadowed
*********************************************************************/

class Hideaway {

    static hideawayHeight = 300;
    static hideawayDeepness = 75;

    /**
     * Sets up initial attributes, caclulated off of given arguments
     * 
     * yPos = the rough Y position of this hideaway. It will be rounded up to the
     */
    constructor(yPos, side) {

        // Caclulates the center position of the object based off the
        // arguments. Forces the X position to be inside either wall, and
        // the Y position to sit evenly between wall lines
        this.pos = new p5.Vector(
            -side * WALL_PADDING + width * ((side + 1) / 2) + side * Hideaway.hideawayDeepness / 2,
            Math.floor(yPos / (height / WALL_STRIPES)) * (height / WALL_STRIPES) + WALL_STRIPES * 0.25
        );
    }

    /**
     * Returns -1 or 1 based off of which side of the canvas this object's
     * X position is on
     */
    getSide() {

        // Calculates the X position if the X = 0 of the coordinate system
        // was in the center of the canvas
        let centeredXPos = this.pos.x - width / 2;

        // Gets -1 or 1, depending on the side
        return centeredXPos / Math.abs(centeredXPos);
    }

    /**
     * Displays the object in its proper position. Must be called before
     * this.drawShadow() and the display functions of other game objects
     * for proper display results
     */
    display() {

        push();
        translate(0, -cameraY);
        rectMode(CENTER);

        // Draws the object frame
        fill(THEME_COLOR);

        rect(
            this.pos.x + 5 * this.getSide(),  // Offsets the frame 5px into the wall
            this.pos.y,
            Hideaway.hideawayDeepness + 10,
            Hideaway.hideawayHeight + 20
        );

        // Draws the object interior
        this.fillObjInterior("#474d4f");

        pop();
    }

    /**
     * Draws the object interior in the given color
     * 
     * interiorColor = the fill color of the interior drawn
     */
    fillObjInterior(fillColor) {

        push();
        fill(fillColor);

        rect(
            this.pos.x,
            this.pos.y,
            Hideaway.hideawayDeepness,
            Hideaway.hideawayHeight
        );

        pop();
    }

    /**
     * Draws a black film over the interior of this object, to give it a
     * shaded appearance
     */
    drawShadow() {
        push();
        translate(0, -cameraY);
        rectMode(CENTER);
        noStroke();

        this.fillObjInterior([0, 0, 0, 125]);

        pop();
    }

    /**
     * Runs all the required functions for an object of this class to
     * work, excluding the deletion of objects that are off-screen and no
     * longer visible
     */
    monitor() {
        this.display();
        this.drawShadow();
    }

    /**
     * Returns true if the p5.Vector pos is overtop of a hideaway, and false
     * otherwise
     * 
     * pos = the p5.Vector position that is being checked for potentially
     *       being inside a hideaway
     * padding = the number of pixels pos it allowed to be outside the
     *           true bounds while still counting as inside them
    */
    static isInHideaway(pos, padding) {
        // Hides the player from cybirds, if they are overtop if the object
        if (Hideaway.getPresentHideaway(pos, padding) != undefined) {
            return true;
        }

        return false;
    }

    /**
     * Returns the hideaway object that the player is currently in.
     * Returns undefined if the player is in no hideaway object
     * 
     * position = the p5.Vector position that is being checked for potentially
     *       being inside a hideaway
     * padding = the number of pixels pos it allowed to be outside the
     *           true bounds while still counting as inside them
     */
    static getPresentHideaway(position, padding) {
        for (let thisHideaway = 0; thisHideaway < hideaways.length; thisHideaway++) {
            
            // Checks if the position is within the bounds and its given padding
            if (position.x > hideaways[thisHideaway].pos.x - Hideaway.hideawayDeepness / 2 - padding &&
                position.x < hideaways[thisHideaway].pos.x + Hideaway.hideawayDeepness / 2 + padding &&
                position.y > hideaways[thisHideaway].pos.y - Hideaway.hideawayHeight / 2 - padding &&
                position.y < hideaways[thisHideaway].pos.y + Hideaway.hideawayHeight / 2 + padding
            ) {
                return hideaways[thisHideaway];
            }
        }
    }
}
