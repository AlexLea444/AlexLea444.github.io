import Snake from './Snake.js';

/**
 * @class
 */
export default class Apple {
    /**
     * @constructor
     * @param {number} numCols - Number of columns of the game grid.
     * @param {number} numRows - Number of rows of the game grid.
     * @description Generates an apple at a random location.
     * numCols and numRows are saved and assumed to be consistent.
     */
    constructor(numCols, numRows) {
        /**
         * The x position of the apple.
         * @type {number}
         */
        this.x = Math.floor(Math.random() * numCols);
        /**
         * The y position of the apple.
         * @type {number}
         */
        this.y = Math.floor(Math.random() * numRows);
        /**
         * The color.
         * @type {string}
         */
        this.color = 'red';

        /**
         * Number of columns of the game grid.
         * @type {number}
         */
        this.numCols = numCols; // Save numCols and numRows for later
        /**
         * Number of rows of the game grid.
         * @type {number}
         */
        this.numRows = numRows;
    }
  
    /**
     * @returns {Location} Current location (x and y position) of apple.
     */
    location() {
        return {x: this.x,
                y: this.y,}
    }
  
    /**
     * Move apple to a square not occupied by the trail.
     * Apple may not be moved to its current location.
     *
     * @param {Snake} snake - Snake to be avoided by moved apple.
     */
    moveNotTo(snake) {
        const prevX = this.x;
        const prevY = this.y;
        this.x = Math.floor(Math.random() * this.numCols);
        this.y = Math.floor(Math.random() * this.numRows);
        while (snake.isTrailAt(this.location()) || (prevX === this.x && prevY === this.y)) {
            this.x = Math.floor(Math.random() * this.numCols);
            this.y = Math.floor(Math.random() * this.numRows);
        }
    }
}
