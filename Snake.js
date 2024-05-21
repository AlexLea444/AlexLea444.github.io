/**
 * @typedef {Object} Location
 * @property {number} x - The x coordinate of the location
 * @property {number} y - The y coordinate of the location
 */

/**
 * @typedef {Object} Velocity
 * @property {number} x - The x velocity of the object
 * @property {number} y - The y velocity of the object
 */

/**
 * Represents a snake's head and trail.
 * Contains position, direction, and color info.
 *
 * @class
 */
export default class Snake {
    /**
     * Most recent segment (location) popped from tail.
     * @type {Location}
     */
    #popped;

    /**
     * @constructor
     * @param {number} numCols - Number of columns of the game grid.
     * @param {number} numRows - Number of rows of the game grid.
     * @description Generates a Snake at a random location, moving right.
     * Player's starting x is in [numCols / 8, numCols / 4)
     * Player's starting y is in [numRows / 8, numRows / 4)
     */
    constructor(numCols, numRows, color) {
        /**
         * The locations of the snake's head.
         * @type {Location}
         */
        this.head = {x: Math.floor((Math.random() + 1) * numCols / 8),
                     y: Math.floor((Math.random() + 1) * numRows / 8)}

        /**
         * The locations of the snake's segments, not including the head.
         * @type {Location[]}
         */
        this.trail = [];
        /**
         * The assumed color of the whole snake, based on first segment.
         * @type {string}
         */
        this.color = color;
        /**
         * The x velocity of the snake head.
         * @type {number}
         */
        this.dx = 1;
        /**
         * The y velocity of the snake head.
         * @type {number}
         */
        this.dy = 0;
    }

    /**
     * Updates the velocity of the head of the snake.
     *
     * @param {Velocity|null} velocity - New velocity of snake, or null (no change).
     */
    setVelocity(velocity) {
        if (velocity === null) {
            return;
        }
        this.dx = velocity.dx;
        this.dy = velocity.dy;
    }
  
    /**
     * Updates the location of the head of the snake by adding new segment.
     *
     * @param {Location} segment - To be added to front (head) of snake
     */
    #pushToFront(segment) {
        this.trail.push({x: segment.x, y: segment.y});
    }
  
    /**
     * Removes trail segment at end of trail, saves for apple.
     */
    #popFromTail() {
        this.#popped = this.trail.shift();
    }
    
    /**
     * Adds snake segment at end of tail.
     * Should only be used if the snake has eaten an apple.
     * @params {Location} Segment to be pushed to tail.
     */
    #pushToTail(segment) {
        this.trail.unshift(segment);
    }

    /**
     * Moves the snake based on its current position and velocity.
     */
    move() {
        this.#pushToFront(this.head);

        this.head.x += this.dx;
        this.head.y += this.dy;

        this.#popFromTail();
    }

    /**
     * Grows the snake by restoring its most recently removed segment.
     */
    grow() {
        this.#pushToTail(this.#popped);
    }

    /**
     * Function to get last element from the queue
     *
     * @returns {Location|string} The oldest segment in the trail, or "Underflow".
     * @description This method does not modify the trail.
     */
    last() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.trail[0];
    }
  
    /**
     * Function to check if the queue is empty
     *
     * @returns {boolean} True if the trail is empty, else false.
     */
    isEmpty() {
        return this.trail.length === 0;
    }
  
    /**
     * Function to get the length of the queue
     *
     * @returns {number} Total lenght of trail, given by number of segments.
     */
    length() {
        return this.trail.length + 1;
    }
  
    /**
     * Returns an iterator for trail segments, not including head.
     *
     * @generator
     * @yields {Location} The next segment of the trail.
     */
    *[Symbol.iterator]() {
        for (let segment of this.trail) {
            yield segment;
        }
    }

    /**
     * Function to search for a location in the trail.
     * 
     * @param {Location} location - Location to compare to search for segment.
     * @returns {boolean} True if a segment exists at location, else false.
     */
    isTrailAt(location) {
        for (let segment of this) {
            if (segment.x == location.x && segment.y == location.y) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Detects if the head of the snake has hit any part of its trail.
     *
     * @returns {boolean} True if the head has hit the trail, else false.
     */
    hitSelf() {
        return this.isTrailAt(this.head);
    }
}
