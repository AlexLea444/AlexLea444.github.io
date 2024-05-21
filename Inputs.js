/**
 * An array of valid directional inputs.
 * @type {string[]}
 */
let validInputs = ['up', 'down', 'left', 'right'];

/**
 * Queue implementation where only valid directional inputs are stored.
 * @class
 */
class InputsList {
    /**
     * The private items array that stores the directions.
     * @type {string[]}
     * @private
     */
    #items;

    /**
     * Creates an empty instance of InputsList.
     * @constructor
     */
    constructor() {
        this.#items = [];
    }

    /**
     * Frees all stored inputs from InputsList.
     */
    clear() {
        this.#items = [];
    }
  
    /**
     * Adds direction to list of inputs, if direction is valid.
     * @param {string} direction - The direction to add.
     */
    enqueue(direction) {
        if (validInputs.indexOf(direction) !== -1) {
            this.#items.push(direction);
        }
    }
  
    /**
     * Removes and returns direction from list of inputs.
     * @returns {string} The oldest input stored in the InputsList.
     * 'Underflow' if InputsList is empty.
     */
    dequeue() {
        if (this.isEmpty()) {
            return 'Underflow';
        }
        return this.#items.shift();
    }

    /**
     * Checks if the InputsList is empty.
     * @returns {boolean} True if the InputsList is empty, otherwise false.
     */
    isEmpty() {
        return this.#items.length === 0;
    }
}

export {InputsList, validInputs};
