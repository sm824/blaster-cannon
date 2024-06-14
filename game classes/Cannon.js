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
  constructor(pos) {
    this.pos = pos;
    this.colors = DEFAULT_CANNON_COLORS;

    // The attribute rotation uses degrees, and tracks the cannon's rotation
    this.rotation = 0;

    this.bullets = [];
    this.isVisible = true;

    this.isJumping = false;
    this.jumpingAngle;
    this.ignoreWallSteps = 0;
    this.bulletCooldown = 0;
    this.health = 5;
    this.damageScreenTimer;
  }

  /**
   * Creates a new bullet, fired from the cannon
   */
  fire() {
    if (this.bulletCooldown == 0) {
      this.bullets.push(new Bullet(this.pos.copy(), this.rotation));
      this.bulletCooldown = 60;

      cannonFireSound.play();
    }
  }

  /**
   * Decrements the cannon's health, and plays the damage sound
   */
  takeDamage() {
    this.health--;
    cannonDamageSound.play();

    this.damageScreenTimer = DAMAGE_SCREEN_TIME;
  }

  /**
   * Begins the cannon's jump, only if it
   * permitted to jump in its current state
   */
  jump() {

    // Simulates where the future position will be if the cannon jumps,
    // to determine if they will end up in walls or not
    let futurePos = this.pos.copy();
    advance(futurePos, SPEED * 2, this.rotation);

    // Allows the player to jump only if they are not jumping already, and
    // are not going to jump through walls
    if (!this.isJumping &&
      (
        futurePos.x > WALL_PADDING && futurePos.x < width - WALL_PADDING ||
        Hideaway.isInHideaway(futurePos, SPEED)
      )
    ) {

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

    translate(
      this.pos.x,
      -(2 * cameraY) + this.pos.y
    );
    rotate(this.rotation);

    // Draws the cooldown indicator on the cannon barrel, if required
    if (this.bulletCooldown > 0) {
      push();

      fill(204, 28, 14, 140);
      noStroke();
      ellipseMode(CENTER);

      circle(
        0,
        42.5,
        30 * this.bulletCooldown * (1 / 60)  // Calculates the size of the cooldown circle
      );

      pop();
    }

    // Calculates the transparency for the fill values based off of whether
    // or not the cannon is hidden in a hideaway
    let opacity;

    if (this.isVisible) {
      opacity = 255;  // Opaque
    } else {
      opacity = 100;   // Translucent (hidden)
    }

    // Draws the cannon body
    fill(
      red(this.colors.base),
      green(this.colors.base),
      blue(this.colors.base),
      opacity
    );
    circle(0, 0, 50); // Draws the circlular base

    fill(
      red(this.colors.barrel),
      green(this.colors.barrel),
      blue(this.colors.barrel),
      opacity
    );
    rect(0, 32.5, 20, 22.5); // Draws the barrel

    fill(
      red(this.colors.body),
      green(this.colors.body),
      blue(this.colors.body),
      opacity
    );
    square(0, 0, 42, 5); // Draws the body

    pop();
  }

  /**
   * Runs all the required functions and processes for
   * the Cannon object to operate
   */
  operateCannon() {

    // Checks if the cannon is in a hideaway
    if (Hideaway.isInHideaway(this.pos, SPEED)) {
      this.isVisible = false;
    }
    else {
      this.isVisible = true;
    }

    // Checks if the cannon has just taken damage, and colors the screen to indicate if it has
    if (this.damageScreenTimer > 0) {
      this.damageScreenTimer--;

      background(
        220,
        0,
        0,
        150 - (150 - this.damageScreenTimer * (150 / DAMAGE_SCREEN_TIME))
      );
    }

    push();

    angleMode(DEGREES);
    rectMode(CENTER);

    this.rotation = aim(this.pos, new p5.Vector(mouseX, mouseY + cameraY));
    this.display();

    if (this.bulletCooldown > 0) {
      this.bulletCooldown--;
    }

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
      if (this.ignoreWallSteps == 0 && !Hideaway.isInHideaway(this.pos, 0) &&
        (
          this.pos.x < WALL_PADDING ||
          this.pos.x > width - WALL_PADDING
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

      // Checks if any bullets have hit an ExtraLife object, and heals cannon
      for (let thisLife = 0; thisLife < extraLives.length; thisLife++) {
        if (getDistance(extraLives[thisLife].pos, this.bullets[thisBullet].pos) < 40 * EXTRA_LIFE_SIZE) {

          // Plays the sound to indicate healing
          healingSound.play();

          // Restores some player health
          if (this.health < 5) {
            this.health++;
          }

          // Marks the extra life to be deleted
          extraLives[thisLife].isOffScreen = true;
        }
      }

      // Deletes the bullets off the screen (NOTE: this must go last in
      // this loop)
      if (this.bullets[thisBullet].isOffScreen) {
        this.bullets.splice(thisBullet, 1);
      }
    }

    pop();
  }
}
