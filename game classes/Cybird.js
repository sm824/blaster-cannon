/*********************************************************************
The class for the cybird enemies present in the game. The method .run()
must be looped for every cybird object to get expected results, as well
as a mechanism to destroy the birds when they're hit. Uses HSL colors
*********************************************************************/

class Cybird {

    isBirdDiving = false;
    birdSize = 0.8;

    /**
     * Sets up this cybird's attributes
     * 
     * pos = the p5.Vector object with the cybird's initial coordinates
     */
    constructor(pos) {
        this.state = CYBIRD_STATES.patrolling;  // Determines what this cybird's current action is (see CYBIRD_STATES declaration in ProjectLibrary.js)
        // ^States:     - 0: flying down hall
        //              - 1: following player
        //              - 2: orbitting player
        //              - 3: diving (attacking)
        //              - 4: Dead (has been shot)

        this.frame = random(60);  // Tracks the frame of the animation
        this.rotation = 0;  // In degrees
        this.pos = pos;

        // Gets randomized colors for the cybird
        this.color1 = this.getRandomHSL();  // Main body color
        this.color2 = this.getRandomHSL();
    }

    /**
     * Returns a random HSL color that sits within a range
     */
    getRandomHSL() {
        return [
            random(12, 32),  // Hue value
            random(0, 22),  // Saturation value
            random(28, 75)  // Light value
        ];
    }

    /**
     * Shows the cybird's hitbox as a grey translucent rectangle. Used
     * for debugging purposes
     */
    displayHitbox() {
        push();

        translate(this.pos);
        translate(0, -cameraY);
        rotate(this.rotation);

        fill(220, 100);
        rectMode(CENTER);
        square(0, 0, CYBIRD_HITBOX_SIZE);

        pop();
    }

    /**
     * Runs all this cybird's animations, displaying them, in addition to
     * tracking the frames for the cybird
     */
    animate() {

        // Tracks this bird's frame number (p5 framerate must be 60)
        this.frame++;

        if (this.frame >= 60) {
            this.frame = 0;
        }

        // Runs the bird's animation if it is not attacking
        if (this.state < CYBIRD_STATES.attacking) {

            push();
            angleMode(DEGREES);
            colorMode(HSL);

            translate(this.pos.x, this.pos.y - cameraY);
            rotate(this.rotation);

            // Draws the wings (this.color2)
            fill(this.color2);

            // Left wing
            push();

            translate(10 * this.birdSize, 10 * this.birdSize);
            rotate(-50 - Math.abs(this.frame - 30) * 3.5);

            triangle(
                0, 0,
                0, 60 * this.birdSize,
                20 * this.birdSize, 45 * this.birdSize
            );

            pop();

            // Right wing
            push();

            translate(-10 * this.birdSize, 10 * this.birdSize);
            rotate(50 + Math.abs(this.frame - 30) * 3.5);

            triangle(
                0, 0,
                0, 60 * this.birdSize,
                -20 * this.birdSize, 45 * this.birdSize
            );

            pop();

            // Draws the rest of the body

            // Draws the neck (this.color2)
            rectMode(CENTER);
            fill(this.color2);
            rect(
                0,
                25 * this.birdSize,
                10 * this.birdSize,
                30 * this.birdSize
            );

            // Draws the tail (this.color2)
            triangle(
                0, -10 * this.birdSize,
                15 * this.birdSize, -40 * this.birdSize,
                -15 * this.birdSize, -40 * this.birdSize
            );

            // Draws the head (this.color1)
            fill(this.color1);
            triangle(
                -10 * this.birdSize, 30 * this.birdSize,
                0, 55 * this.birdSize,
                10 * this.birdSize, 30 * this.birdSize
            );

            // Draws the eyes
            ellipseMode(CENTER);
            fill("#cf4444");

            circle(  // Left eye
                -8 * this.birdSize,
                40 * this.birdSize,
                8 * this.birdSize
            );
            circle(  // Right eye
                8 * this.birdSize,
                40 * this.birdSize,
                8 * this.birdSize
            );

            // Draws the body (this.color1)
            fill(this.color1);
            rect(
                0,
                0,
                35 * this.birdSize,
                40 * this.birdSize,
                10 * this.birdSize
            );

            pop();
        }
    }

    /**
     * Runs all the necessary operations for the cybird to work
     */
    run() {
        this.animate();
    }

}
