/*********************************************************************
The class for the bullet objects fired by the cannon. These are
stored in the Cannon.bullets attribute of the player's cannon, and are
updated in a loop found in draw() of sketch.js
*********************************************************************/

class Bullet {
  /**
   * Sets initial attributes.
   *
   * startingBulletPosition = the starting bulletPositionition of the bullet,
   *                          from which it will fly
   * angle = the angle in degrees that the bullet will
   *         move
   */
  constructor(startingBulletPosition, angle) {
    this.pos = startingBulletPosition;
    this.angle = angle;
    this.diameter = 5;

    this.isOffScreen = false;

    // Moves the bullet to the tip of the cannon
    advance(this.pos, 40, this.angle);
  }

  /**
   * Performs necessary procedures, such as monitoring
   * for the bullet to go off the screen and moving it
   * in its direction (determined by this.angle)
   */
  monitor() {
    // Moves the bullet
    advance(this.pos, SPEED, this.angle);

    // Determines if the bullet has gone off-screen
    if (
      this.pos.x < 0 ||
      this.pos.x > width ||
      this.pos.y < 0 ||
      this.pos.y > height
    ) {
      this.isOffScreen = true;
    }
  }
}
