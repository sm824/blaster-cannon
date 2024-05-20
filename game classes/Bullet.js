class Bullet {
    /**
     * Sets initial attributes.
     *
     * startingBulletPosition = the starting bulletPositionition of the bullet,
     *               from which it will fly
     * angle = the angle in degrees that the bullet will
     *         move
     */
    constructor(startingBulletPosition, angle) {
      this.bulletPosition = startingBulletPosition;
      this.angle = angle;
      this.diameter = 5;
  
      this.isOffScreen = false;
  
      // Moves the bullet to the tip of the cannon
      this.advance(40);
    }
  
    /**
     * Moves the bullet forwards, by the number of pixels
     * given, in the direction specified by its angle
     * attribute.
     *
     * distance = the distance in pixels which the bullet
     *            moves
     */
    advance(distance) {
      // Offsets the angle by 90, and converts it to radians
      this.bulletPosition.x +=
        distance * Math.cos((this.angle + 90) * (PI / 180));
      this.bulletPosition.y +=
        distance * Math.sin((this.angle + 90) * (PI / 180));
    }
  
    /**
     * Performs necessary procedures, such as monitoring
     * for the bullet to go off the screen and moving it
     * in its direction (determined by this.angle)
     */
    monitor() {
      // Moves the bullet
      this.advance(5);
  
      // Determines if the bullet has gone off-screen
      if (
        this.bulletPosition.x < 0 ||
        this.bulletPosition.x > width ||
        this.bulletPosition.y < 0 ||
        this.bulletPosition.y > height
      ) {
        this.isOffScreen = true;
      }
    }
  }
  