/*********************************************************************
The class for the extra lives that spawn randomly. Most main processes
for the objects are run by Object.monitor(), excluding the actions run
to delete them or detect bullets, which must be run externally
*********************************************************************/

class ExtraLife {

    static heartColor = [204, 51, 64];

    /**
     * Prepares the heart by setting necessary attributes
     */
    constructor(pos) {
        this.pos = pos;
        this.currentFrame = random(0, 30);
        this.isOffScreen = false;
    }

    /**
     * Displays the heart
     */
    display() {
        push();
        translate(0, -cameraY);

        // Draws the glowing area around the heart
        fill(...ExtraLife.heartColor, 100 - this.currentFrame * 3);
        ellipseMode(CENTER);
        noStroke();

        circle(this.pos.x, this.pos.y, 80);

        // Fills in the gap down the center of the heart
        fill(ExtraLife.heartColor);
        stroke(ExtraLife.heartColor);
        strokeWeight(1);

        line(
            this.pos.x, this.pos.y - 15 * EXTRA_LIFE_SIZE,
            this.pos.x, this.pos.y + 30 * EXTRA_LIFE_SIZE
        );

        // Draws the heart (left then right sides)
        stroke("black");
        
        for (let i = WALL_SIDES.left; i <= WALL_SIDES.right; i += 2) {
            curve(
                this.pos.x - 200 * i * EXTRA_LIFE_SIZE, this.pos.y + 175 * EXTRA_LIFE_SIZE,
                this.pos.x, this.pos.y - 15 * EXTRA_LIFE_SIZE,
                this.pos.x, this.pos.y + 30 * EXTRA_LIFE_SIZE,
                this.pos.x - 270 * i * EXTRA_LIFE_SIZE, this.pos.y + 80 * EXTRA_LIFE_SIZE
            );
        }

        pop();
    }

    /**
     * Runs all the required functions on the heart, excluding boosting
     * player health after shot and deleting self. These few are performed
     * inside the Cannon class
     */
    monitor() {

        // Manages the frames
        this.currentFrame++;

        if (this.currentFrame >= 30) {
            this.currentFrame = 0;
        }

        this.display();

        // Moves the object forwards
        advance(this.pos, SPEED / 2, 0);

        // Determines if the object should be marked as being off the visible screen
        if (this.pos.y > cameraY + height + 200) {
            this.isOffScreen = true;
        }
    }
}
