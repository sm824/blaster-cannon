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
        this.orbitRotation = 0;
        this.orbitDirection = 1;  // +1 for clockwise, -1 for counter-clockwise
        this.pos = pos;
        this.fleeingPos = NaN;  // Equals NaN when the cybird is not fleeing, and holds a p5.Vector object when it is

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
     * Moves the cybird down the hall at 1/3 the speed of the cannon and
     * bullets, and watches for the nearby player, to switch the bird's
     * state to chasing when the player is seen
     */
    patrol() {
        advance(this.pos, SPEED / 3, this.rotation);

        // Monitors for players
        if (player.isVisible && player.pos.y - this.pos.y < CYBIRD_ORBIT_RANGE + CYBIRD_CHASE_DISTANCE) {
            this.state = CYBIRD_STATES.chasing;
        }
    }

    /**
     * Runs the operations for the bird to chase the player until it is in orbitting range
     */
    chase() {
        this.rotation = aim(this.pos, player.pos);
        advance(this.pos, SPEED, this.rotation);  // The cybird cannot go slower than SPEED, or the player could outrun it

        if (getDistance(player.pos, this.pos) < CYBIRD_ORBIT_RANGE) {
            this.state = CYBIRD_STATES.orbitting;
            this.orbitRotation = aim(player.pos, this.pos);
            this.orbitDirection = [-1, 1][Math.floor(random(0, 2))];  // Evaluates to a 1 or -1
        }
    }

    /**
     * Moves the cybird in a circle around the player.
     * During this stage, there is a chance the cybird may attack
     */
    orbit() {

        // Changes the rotation to be perpendicular to the angle at which the cybird orbits the cannon
        // This makes the cybird point the direction it is going
        this.rotation = this.orbitRotation + 90 * this.orbitDirection;

        // Checks if the cybird has met a wall
        if (this.pos.x > width - WALL_PADDING || this.pos.x < WALL_PADDING) {
            advance(this.pos, 20, -this.rotation);  // Prevents the cybird from getting stuck in a wall
            this.orbitDirection = -this.orbitDirection;

            // Checks if the cybird is still in the wall, meaning the player has gotten it stuck during a jump
            if (this.pos.x > width - WALL_PADDING || this.pos.x < WALL_PADDING) {
                
                this.state = CYBIRD_STATES.fleeing;

                // Finds a position that is away from the player
                if (player.pos < width/2) {   // Fleeing to the left wall
                    this.fleeingPos = new p5.Vector(
                        width - WALL_PADDING - 100,
                        cameraY + random(-height/2, height/2)
                    );
                }
                else {  // Fleeing to the right wall
                    this.fleeingPos = new p5.Vector(
                        WALL_PADDING + 100,
                        cameraY + random(-height/2, height/2)
                    );
                }
            }
    }
        else {
            this.orbitRotation += this.orbitDirection;  // Orbits the cybird

            // Moves the cybird to match the calculated orbit
            this.pos = player.pos.copy();
            advance(
                this.pos,
                CYBIRD_ORBIT_RANGE,
                this.orbitRotation
            );
        }
    }

    /**
     * Uses a random location away from the cannon for the cybird to
     * flee to, before it comes back again. The location used is
     * this.fleeingPos, and it should be set to a p5.Vector object prior
     * to this method call, and set to NaN when the state changes to
     * something other than CYBIRD_STATES.fleeing
     */
    flee() {

        this.rotation = aim(this.pos, this.fleeingPos);
        advance(this.pos, SPEED, this.rotation);

        if (getDistance(this.pos, this.fleeingPos) < 20) {
            this.fleeingPos = NaN;  // This marks that the cybird is finished fleeing
            this.state = CYBIRD_STATES.chasing;
        }
    }

    /**
     * Runs all the necessary operations for the cybird to work
     */
    run() {
        this.animate();

        if (this.state == CYBIRD_STATES.patrolling) {
            this.patrol();
        } else if (this.state == CYBIRD_STATES.chasing) {
            this.chase();
        } else if (this.state == CYBIRD_STATES.orbitting) {
            this.orbit();
        } else if (this.state == CYBIRD_STATES.fleeing) {
            this.flee();
        }
    }

}
