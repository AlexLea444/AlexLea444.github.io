/**
 * @typedef {Object} Location
 * @property {number} x - The x coordinate of the location
 * @property {number} y - The y coordinate of the location
 */

/**
 * Represents a segment of a trail.
 *
 * @class
 */
class TrailSegment {
    /**
     * @constructor
     * @param {Location} location 
     */
    constructor(location) {
        /**
         * The x coordinate.
         * @type {number}
         */
        this.x = location.x;
        /**
         * The x coordinate.
         * @type {number}
         */
        this.y = location.y;
        /**
         * The color.
         * @type {string}
         */
        this.color = 'green';
    }
  
    /**
     * Copy constructor
     *
     * @returns {TrailSegment}
     */
    copy() {
        return new TrailSegment(this.x, this.y);
    }
}

/**
 * Represents a snake trail, contains positions and colors.
 *
 * @class
 */
class Trail {
    /**
     * @param {TrailSegment} head - To be the head of the snake trail
     */
    constructor(head) {
        /**
         * The first segments of the snake.
         * @type {TrailSegment[]}
         */
        this.items = new Array(head);
        /**
         * The assumed color of the whole snake, based on first segment.
         * @type {string}
         */
        this.color = head.color;
    }
  
    /**
     * Pushes given trail segment to start of trail.
     *
     * @param {TrailSegment} segment - To be added to front (head) of snake
     */
    enqueue(segment) {
        this.items.push(segment);
    }
  
    /**
     * Removes and returns trail segment at end of trail.
     *
     * @returns {TrailSegment|string} The oldest segment in the trail, or "Underflow".
     * @description This method removes the oldest segment from the trail.
     */
    dequeue() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.items.shift();
    }

    /**
     * Function to get last element from the queue
     *
     * @returns {TrailSegment|string} The oldest segment in the trail, or "Underflow".
     * @description This method does not modify the trail.
     */
    last() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.items[0];
    }
  
    /**
     * Function to check if the queue is empty
     *
     * @returns {boolean} true if the trail is empty, else false.
     */
    isEmpty() {
        return this.items.length === 0;
    }
  
    /**
     * Function to get the length of the queue
     *
     * @returns {number} Total lenght of trail, given by number of segments.
     */
    length() {
        return this.items.length;
    }
  
    /**
     * Returns an iterator for trail segments.
     *
     * @generator
     * @yields {TrailSegment} The next segment of the trail.
     */
    *[Symbol.iterator]() {
        for (let item of this.items) {
            yield item;
        }
    }

    /**
     * Function to search for a location in the trail
     * 
     * @param {Location} location - Location to compare to search for segment.
     * @returns {boolean} true if a segment exists at location, else false.
     */
    isTrailAt(location) {
        for (let segment of this) {
            if (segment.x == location.x && segment.y == location.y) {
                return true;
            }
        }
        return false;
    }
}

/**
 * Represents a player in the snake game.
 *
 * @class
 */
class Player {
    /**
     * @constructor
     * @param {number} numCols - Number of columns of the game grid.
     * @param {number} numRows - Number of rows of the game grid.
     * @description Generates a player at a random location, moving right.
     * Player's starting x is in [numCols / 8, numCols / 4)
     * Player's starting y is in [numRows / 8, numRows / 4)
     */
    constructor(numCols, numRows) {
        /**
         * The x position of the player.
         * @type {number}
         */
        this.x = Math.floor((Math.random() + 1) * numCols / 8);
        /**
         * The y position of the player.
         * @type {number}
         */
        this.y = Math.floor((Math.random() + 1) * numRows / 8);
        /**
         * The x velocity of the player.
         * @type {number}
         */
        this.dx = 1;
        /**
         * The y velocity of the player.
         * @type {number}
         */
        this.dy = 0;
    }

    /**
     * @returns {Location} Current location (x and y position) of player.
     */
    location() {
        return {x: this.x,
                y: this.y,}
    }
}

export {TrailSegment, Trail, Player};
