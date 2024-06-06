/*********************************************************************
A class used to make buttons stylized to the game
*********************************************************************/

class BlasterCannonButton {

    constructor(text, xPos, yPos, buttonWidth, buttonHeight, operation, fontSize) {
        this.text = text;

        this.pos = new p5.Vector(xPos, yPos);
        this.dimensions = new p5.Vector(buttonWidth, buttonHeight);
        this.fontSize = fontSize;

        this.isTouchingCursor = false;
        this.buttonOperation = operation;

        this.presentNewlines = 0;

        // Determines how many lines of text are in this.text
        for (let thisChar = 0; thisChar < this.text.length; thisChar++) {
            if (this.text[thisChar] == "\n") {
                this.presentNewlines++;
            }
        }
    }

    drawButton() {

        push();
        textAlign(CENTER);
        textSize(this.fontSize);

        // Draws the borders
        fill(THEME_COLOR);
        rect(
            this.pos.x,
            this.pos.y,
            this.dimensions.x,
            this.dimensions.y,
            12
        );

        // Draws the interior
        fill(SECONDARY_COLOR);
        rect(
            this.pos.x + BUTTON_BORDER_PADDING,
            this.pos.y + BUTTON_BORDER_PADDING,
            this.dimensions.x - BUTTON_BORDER_PADDING * 2,
            this.dimensions.y - BUTTON_BORDER_PADDING * 2,
            10
        );

        // Draws the Decorative bars
        push();
        rectMode(CENTER);

        rect(  // The top bar
            this.pos.x + this.dimensions.x / 2,
            this.pos.y + BUTTON_BORDER_PADDING / 2,
            this.dimensions.x / 3,
            BUTTON_BORDER_PADDING / 2,
            15
        );

        rect(  // The bottom bar
            this.pos.x + this.dimensions.x / 2,
            this.pos.y + this.dimensions.y - BUTTON_BORDER_PADDING / 2,
            this.dimensions.x / 3,
            BUTTON_BORDER_PADDING / 2,
            15
        );

        pop();

        // Draws a dark overlay, if the cursor is over the button
        if (mouseX > this.pos.x &&
            mouseX < this.pos.x + this.dimensions.x &&
            mouseY > this.pos.y &&
            mouseY < this.pos.y + this.dimensions.y
        ) {
            fill(...THEME_COLOR, 100)
            rect(
                this.pos.x,
                this.pos.y,
                this.dimensions.x,
                this.dimensions.y,
                12
            );

            this.isTouchingCursor = true;
        } else {
            this.isTouchingCursor = false;
        }

        // Writes the button's text
        fill("black");

        text(
            this.text,
            this.pos.x + this.dimensions.x / 2,
            this.pos.y + this.dimensions.y / 2 + this.fontSize / 2 - this.presentNewlines*(this.fontSize/2)
        );

        pop();
    }

    /**
     * Checks if the player has clicked the button, and runs its
     * command
     */
    isClicked() {
        if (this.isTouchingCursor && mouseIsPressedOnce) {
            this.buttonOperation();
        }
    }

    /**
     * Runs all the necessary functions for the button to work
     */
    monitorButton() {
        this.isClicked();
        this.drawButton();
    }
}
