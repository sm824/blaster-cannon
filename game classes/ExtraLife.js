
class ExtraLife {

    static heartColor = "#cc3340";

    /**
     * Prepares the heart by setting necessary attributes
     */
    constructor(pos) {
        this.pos = pos;
        this.currentFrame = random(0, 60);
        this.isOffScreen = false;
    }

    /**
     * Displays the heart
     */
    display() {
        push();
        translate(0, -cameraY);
        fill(ExtraLife.heartColor);

        // Fills in the gap down the center
        stroke(ExtraLife.heartColor);
        line(
            this.pos.x, this.pos.y - 15 * EXTRA_LIFE_SIZE,
            this.pos.x, this.pos.y + 30 * EXTRA_LIFE_SIZE
        );

        // Draws the heart (left then right sides)
        stroke("black");
        
        for (let i = -1; i <= 1; i += 2) {
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
        this.display();

        advance(this.pos, SPEED / 2, 0);

        if (this.pos.y > cameraY + height) {
            this.isOffScreen = true;
        }
    }
}
