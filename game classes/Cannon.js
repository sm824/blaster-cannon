/*********************************************************************
The class for the cannon character, controlled by the user. All the
code for the behaviour of the character is found in this file, and is
run from the draw() loop of sketch.js by the method
this.operateCannon(), with the exception of its firing and jumping
events, which are found in keyTyped() of sketch.js
*********************************************************************/

class Cannon {
  /**
   * pos = the p5.Vector position of this cannon
   * color1 = the color for the body of this cannon
   * color2 = the color for the barrel of this cannon
   */
  constructor(pos, color1, color2) {
    this.pos = pos;
    this.colors = [color1, color2];

    // The attribute rotation uses degrees, and tracks the cannon's rotation
    this.rotation = 0;

    this.bullets = [];
    this.isVisible = true;

    this.isJumping = false;
    this.jumpingAngle;
    this.ignoreWallSteps = 0;
  }

  /**
   * Updates the cannon's rotation (in degrees)
   * to point towards the mouse
   */
  aim() {
    this.rotation =
      Math.atan((mouseY + cameraY - this.pos.y) / (mouseX - this.pos.x)) / (PI / 180) + 90;

    if (mouseX >= this.pos.x) {
      this.rotation += 180;
    }
  }

  /**
   * Creates a new bullet, fired from the cannon
   */
  fire() {
    this.bullets.push(new Bullet(this.pos.copy(), this.rotation));
  }

  /**
   * Begins the cannon's jump, only if it
   * permitted to jump in its current state
   */
  jump() {

    if (!this.isJumping &&
      (this.pos.x < width / 2 && this.rotation > 180 ||  // Left wall
        this.pos.x > width / 2 && this.rotation < 180  // Right wall
      )) {
      this.isJumping = true;
      this.jumpingAngle = this.rotation;

      // Sets the cannon to ignore collisions with walls for 2 frames
      this.ignoreWallSteps = 2;
    }
  }

  /**
   * Draws the cannon in colors specified by
   * the items of the colors attribute
   */
  display() {
    push();

    translate(this.pos.x, this.pos.y);
    translateToScreen();
    rotate(this.rotation);

    fill("grey");
    circle(0, 0, 50); // Draws the circlular base

    fill(this.colors[1]);
    rect(0, 25, 20, 35); // Draws the barrel

    fill(this.colors[0]);
    square(0, 0, 42, 5); // Draws the body

    pop();
  }

  /**
   * Runs all the required functions and processes for
   * the Cannon object to operate
   */
  operateCannon() {
    push();

    angleMode(DEGREES);
    rectMode(CENTER);

    this.aim();
    this.display();

    // Runs the cannon's jump actions, if jumping
    if (this.isJumping) {

      // Moves the cannon
      if (this.pos.y < cameraY + height) {
        advance(this.pos, SPEED, this.jumpingAngle);
      }
      
      // Deflects the cannon off the bottom of the screen
      else {

        // Moves the player back slightly, so the end is not detected again
        this.pos.y -= SPEED;

        // Determines the direction to deflect the player
        if (this.jumpingAngle < 180) {  // Left
          this.jumpingAngle = 90;
        }
        else {  // Right
          this.jumpingAngle = 270;
        }
      }

      // Checks if the cannon has met a wall after its collision
      // invulnerability is up, and stops it
      if (this.ignoreWallSteps == 0 &&
        (this.pos.x < WALL_PADDING ||
          this.pos.x > DIMENSIONS[0] - WALL_PADDING
        )) {
        this.isJumping = false;
      }
    }

    // Decrements the number of frames that the cannon ignores impacts
    // after jumping
    if (this.ignoreWallSteps > 0) {
      this.ignoreWallSteps--;
    }

    // Monitors the bullets
    for (let thisBullet = 0; thisBullet < this.bullets.length; thisBullet++) {
      this.bullets[thisBullet].monitor();

      // Draws the bullets' bodies
      push();

      fill("black");
      circle(
        this.bullets[thisBullet].pos.x,
        this.bullets[thisBullet].pos.y - cameraY * 2,
        this.bullets[thisBullet].diameter
      );

      pop();

      if (this.bullets[thisBullet].isOffScreen) {
        this.bullets.splice(thisBullet, 1);
      }
    }

    pop();
  }
}
