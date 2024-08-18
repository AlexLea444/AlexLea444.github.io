import Apple from './Apple.js';
import Snake from './Snake.js';
import {InputsList, validInputs} from './Inputs.js';

// Get references to HTML elements
/** @type {HTMLCanvasElement} */
const gameCanvas = document.getElementById('gameCanvas');
/** @type {HTMLElement} */
const infoOverlay = document.getElementById('infoOverlay');
/** @type {CanvasRenderingContext2D} */
const ctx = gameCanvas.getContext('2d');
/** @type {HTMLElement} */
const pauseOverlay = document.getElementById('pauseOverlay');
/** @type {HTMLElement} */
const pauseButton = document.querySelector('.pauseButton');
/** @type {HTMLElement} */
const gameInfo = document.getElementById('gameInfo');
/** @type {HTMLElement} */
const gridInfo = document.getElementById('gridInfo');
/** @type {HTMLElement} */
const finalScore = document.getElementById('finalScore');
/** @type {HTMLElement} */
const startButton = document.getElementById('startButton');
/** @type {HTMLElement} */
const shareButton = document.getElementById('shareButton');

// Constants for grid size and dimensions
/** @type {number} */
const cellSize = 63; // Size of each grid cell
/** @type {number} */
const numRows = gameCanvas.height / cellSize;
/** @type {number} */
const numCols = gameCanvas.width / cellSize;
/** @type {{left: number, right: number, top: number, bottom: number}} */
const gridBounds = {
    left: 0,
    right: numCols - 1,
    top: 0,
    bottom: numRows - 1,
};

// Helpful type definitions for interacting with positions as objects
/**
 * @typedef {import('./Snake.js').Location} Location
 */
/**
 * @typedef {import('./Snake.js').Velocity} Velocity
 */

// Load highscore from local storage
/** @type {number} */
let highscore = localStorage.getItem('highscore');
if (highscore === null) {
    highscore = 0;
}

// Initialize game objects
/** @type {Snake} */
let snake = new Snake(numCols, numRows, 'green', 'DarkGreen');
/** @type {Apple} */
let apple = new Apple(numCols, numRows);

// Module for storing directional inputs (FIFO)
/** @type {InputsList} */
let inputs = new InputsList();

// Define constants for game flow
/** @constant {number} */
const SWIPE_THRESHOLD = 30;

// Define pseudo-constant for speed (changes for different levels)
/** @type {number} */
let frame_period_ms = 190;

// Queue of colors for level upgrades
let colors = ['Salmon', 'Orange', 'LightYellow', 'LawnGreen', 'Blue',
                'MediumPurple', 'Cornsilk'];
let head_colors = ['OrangeRed', 'DarkOrange', 'Yellow', 'Lime', 'DarkBlue',
                    'Purple', 'Black'];

function next_color() {
    let ret = colors.shift();
    if (ret == undefined) {
        return 'green';
    } else {
        return ret;
    }
}

function next_head_color() {
    let ret = head_colors.shift();
    if (ret == undefined) {
        return 'DarkGreen';
    } else {
        return ret;
    }
}

// Define constants for collision states
/** @constant {string} */
const COLLISION_STATE_WALL = 'the wall';
/** @constant {string} */
const COLLISION_STATE_TAIL = 'your tail';
/** @constant {string} */
const COLLISION_STATE_NONE = 'nothing';

// Initialize the current collision state
/** @type {string} */
let collisionState = COLLISION_STATE_NONE;

// Used to update location of snake on regular interval
/** @type {number} */
let moveIntervalId;

// Define constants for game states
/** @constant {string} */
const GAME_STATE_START = 'start';
/** @constant {string} */
const GAME_STATE_RUNNING = 'running';
/** @constant {string} */
const GAME_STATE_PAUSED = 'paused';
/** @constant {string} */
const GAME_STATE_GAME_OVER = 'game_over';

// Initialize the current game state
/** @type {string} */
let gameState; 
updateGameState(GAME_STATE_START);

/**
 * Updates the game state.
 * @param {string} newState - The new game state to update to.
 */
function updateGameState(newState) {
    if (highscore < snake.score()) {
        highscore = snake.score();
        localStorage.setItem('highscore', highscore);
    }
    switch (newState) {
        case GAME_STATE_START:
            infoOverlay.style.display = "flex";
            shareButton.style.display = "none";
            gameInfo.innerHTML = "Ready to go?";
            gridInfo.innerHTML = "Swipe to change direction.";
            finalScore.textContent = `High Score: ${highscore}`;
            startButton.textContent = "Start";
            draw();

            break;
        case GAME_STATE_RUNNING:
            infoOverlay.style.display = "none";
            pauseOverlay.style.display = "none";
            pauseButton.style.opacity = 0.5;
            pauseButton.textContent = "PAUSE";
            // Set an interval for the movePlayer function (every _ ms)
            moveIntervalId = setInterval(updateSnake, frame_period_ms);

            break;
        case GAME_STATE_PAUSED:
            // Pause the movement of th
            clearInterval(moveIntervalId);
            inputs.clear();

            pauseOverlay.style.display = "flex";
            pauseButton.style.opacity = 1;
            pauseButton.textContent = "UNPAUSE";

            break;
        case GAME_STATE_GAME_OVER:
            clearInterval(moveIntervalId);
            infoOverlay.style.display = "flex";
            if (snake.score() > highscore) {
                gameInfo.innerHTML = `Game Over<br>New high score!`;
            } else {
                gameInfo.innerHTML = `Game Over<br>You hit ${collisionState}`;
            }
            gridInfo.innerHTML = gridToHTML();
            finalScore.textContent = `Final Score: ${snake.score()}`;
            shareButton.style.display = "inline-block";
            startButton.textContent = "Restart";

            break;
        default:
            // Handle unexpected state
            break;
    }

    gameState = newState;
}

/**
 * Generates HTML representation of the grid.
 * @returns {string} - HTML string of the grid.
 */
function gridToHTML() {
    let grid = "";

    for (let i = -1; i <= numRows; i++) {
        for (let j = -1; j <= numCols; j++) {
            const location = {x: j, y: i,};
            if (snake.head.x === j && snake.head.y === i) {
                grid = grid.concat("&#128165;");
            } else if (snake.isTrailAt(location)) {
                grid = grid.concat("&#129001;");
            } else if (apple.x === j && apple.y === i) {
                grid = grid.concat("&#127822;");
            } else if (isInBounds(j, i, gridBounds)) {
                grid = grid.concat("&#11036;");
            } else {
                grid = grid.concat("&#11035;");
            }
        }
        grid = grid.concat("<br>");
    }

    return grid;
}

function gridToText() {
        return gridToHTML().replaceAll('<br>', '\n')
                            .replaceAll('&#129001;',"🟩")
                            .replaceAll('&#11035;', "⬛")
                            .replaceAll('&#11036;', "⬜")
                            .replaceAll('&#127822;', "🍎")
                            .replaceAll('&#128165;', "💥")
                            .concat(`\nscore: ${snake.score()}`);

}

/**
 * Draws the grid compononents on the canvas.
 */
function draw() {
    // Clear the gameCanvas
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw apple
    drawSquare(apple);

    // Draw grid
    drawGrid();

    // Draw snake
    drawSnake();

    document.getElementById('score').textContent = `Score: ${snake.score()}`;
}

/**
 * @typedef {Object} Square
 * @property {number} x - The x coordinate of the square (left).
 * @property {number} y - The y coordinate of the square (top).
 * @property {string} color - The color of the square.
 */

/**
 * @param {Square} square - The square to draw.
 */
function drawSquare(square) {
    ctx.fillStyle = square.color;
    ctx.fillRect(square.x * cellSize, square.y * cellSize, cellSize, cellSize);
}

/**
 * Draw the underlying grid of the game.
 */
function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";
  
    // Draw vertical lines
    for (let i = 0; i <= numCols; i++) {
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, gameCanvas.height);
    }
  
    // Draw horizontal lines
    for (let j = 0; j <= numRows; j++) {
        ctx.moveTo(0, j * cellSize);
        ctx.lineTo(gameCanvas.width, j * cellSize);
    }
  
    ctx.stroke();
}

/**
 * Draw segment of snake with a dark outline
 * @param {Location} segment - The segment of the snake to be drawn.
 * @param {string} color - The color of the given segment.
 */
function drawSegment(segment, color) {
    ctx.beginPath();
    ctx.strokeStyle = "#222";

    drawSquare({x: segment.x, y: segment.y, color: color});

    ctx.moveTo(segment.x * cellSize, segment.y * cellSize);

    ctx.lineTo((segment.x + 1) * cellSize, segment.y * cellSize);
    ctx.lineTo((segment.x + 1) * cellSize, (segment.y + 1) * cellSize);
    ctx.lineTo(segment.x * cellSize, (segment.y + 1) * cellSize);
    ctx.lineTo(segment.x * cellSize, segment.y * cellSize);

    ctx.stroke();
}

/**
 * Draws a line between segments with the color of the snake, essentially
 * erasing the grid lines.
 * @param {Location} prev - The previous segment in the snake.
 * @param {Location} curr - The current segment in the snake.
 * @description Note: The segment order does not matter, except that they are
 * next to each other.
 */
function drawBetweenSegments(prev, curr) {
    if (prev === null || curr === null) {
        return;
    }

    if (curr.x === prev.x - 1) {
        // current segment is left of previous segment
        ctx.moveTo((curr.x + 1) * cellSize, curr.y * cellSize + 1);
        ctx.lineTo((curr.x + 1) * cellSize, (curr.y + 1) * cellSize - 1);
    } else if (curr.x === prev.x + 1) {
        // current segment is right of previous segment
        ctx.moveTo(curr.x * cellSize, curr.y * cellSize + 1);
        ctx.lineTo(curr.x * cellSize, (curr.y + 1) * cellSize - 1);
    } else if (curr.y === prev.y - 1) {
        // current segment is on top of previous segment
        ctx.moveTo(curr.x * cellSize + 1, (curr.y + 1) * cellSize);
        ctx.lineTo((curr.x + 1) * cellSize - 1, (curr.y + 1) * cellSize);
    } else if (curr.y === prev.y + 1) {
        // current segment is below previous segment
        ctx.moveTo(curr.x * cellSize + 1, curr.y * cellSize);
        ctx.lineTo((curr.x + 1) * cellSize - 1, curr.y * cellSize);
    }
}

/**
 * Draw the snake.
 */
function drawSnake() {
    // First, draw every segment of the snake with a dark square around it
    drawSegment(snake.head, snake.head_color);

    for (let segment of snake) {
        drawSegment(segment, snake.color);
    }


    // Then, go back in and remove the lines between snake segments
    let prev = null;

    ctx.beginPath();
    ctx.strokeStyle = snake.color;

    for (const curr of snake) {
        drawBetweenSegments(prev, curr);
        prev = curr;
    }
    
    drawBetweenSegments(prev, snake.head);

    ctx.stroke();
}

/**
 * Move the snake based on inputs, update position/game state if necessary.
 */
function updateSnake() {

    // Update velocity, ignoring inputs that don't affect velocity
    const prevVelocity = {dx: snake.dx, dy: snake.dy};
    let newVelocity = getNewVelocity(inputs.dequeue(), prevVelocity);
    while ((newVelocity === prevVelocity) && (newVelocity !== null)) {
        newVelocity = getNewVelocity(inputs.dequeue(), prevVelocity);
    }

    snake.setVelocity(newVelocity);

    snake.move();
  
    if (!isInBounds(snake.head.x, snake.head.y, gridBounds)) {
        // Check if the snake is within bounds
        collisionState = COLLISION_STATE_WALL;
    } else if (snake.hitSelf()) {
        // Check if the snake has hit itself
        collisionState = COLLISION_STATE_TAIL;
    } else if (snake.head.x === apple.x && snake.head.y === apple.y) {
        // Check if the snake has hit an apple
        if (snake.length() == numRows * numCols - 1) {
            // Check if the user has won
            snake.upgrade(next_color(), next_head_color())
            frame_period_ms -= 20;
        } else {
            snake.grow();
        }
        apple.moveNotTo(snake);
    }
    if (collisionState === COLLISION_STATE_NONE) {
        draw();
    } else {
        updateGameState(GAME_STATE_GAME_OVER);
    }
}

/**
 * Replaced by snake.score()
 * @returns {number} The score of the game, same as the length of the trial.
 */
/* function score() {
    return snake.length();
} */

/**
 * Reset game objects, input logic, and game states.
 * Update local high score if necessary.
 */
function resetGame() {
    inputs.clear();
    collisionState = COLLISION_STATE_NONE;
    snake = new Snake(numCols, numRows, 'green', 'DarkGreen');
    colors = ['Salmon', 'Orange', 'LightYellow', 'LawnGreen', 'Blue',
                'MediumPurple', 'Cornsilk'];
    head_colors = ['OrangeRed', 'DarkOrange', 'Yellow', 'Lime', 'DarkBlue',
                    'Purple', 'Black'];
    frame_period_ms = 190;
    apple.moveNotTo(snake);
    resetTouches();
    draw();
}

/**
 * Gives the velocity of the snake based on the given direction.
 * If given 'Underflow', checks for current input from touchscreen.
 * @param {string} direction - Direction of new motion, should be in validInputs.
 * @param {Velocity} prevVelocity - The current (previous) velocity of the snake.
 * @returns {Velocity|null} The new velocity the snake should have, or null
 * if the velocity shouldn't change.
 */
function getNewVelocity(direction, prevVelocity) {
    if (direction === 'up') {
        if (prevVelocity.dx !== 0) {
            return {dx: 0, dy: -1};
        }
    } else if (direction === 'down') {
        if (prevVelocity.dx !== 0) {
            return {dx: 0, dy: 1};
        }
    } else if (direction === 'left') {
        if (prevVelocity.dy !== 0) {
            return {dx: -1, dy: 0};
        }
    } else if (direction === 'right') {
        if (prevVelocity.dy !== 0) {
            return {dx: 1, dy: 0};
        }
    } else if (direction === 'Underflow') {
        // No input from input list, so we can check if the user is swiping
        const newDirection = resolveDirection(touchStart, touchCurr);

        if (!isInBounds(touchCurr.x, touchEnd.y, pauseButtonBounds) || 
            pauseDetectionState === PAUSE_DETECTION_NOT_WAITING) {

            if (validInputs.indexOf(newDirection) !== -1) {
                // Update starting points if a swipe was detected.
                // Allows for finger held on screen, and prevents repeat inputs.
                touchStart.x = touchCurr.x;
                touchStart.y = touchCurr.y;
            }

            return getNewVelocity(newDirection, prevVelocity);
        }
    }

    return null;
}

/**
 * Toggle between GAME_STATE_RUNNING and GAME_STATE_PAUSED.
 */
function togglePause() {
    switch (gameState) {
        case GAME_STATE_RUNNING:
            updateGameState(GAME_STATE_PAUSED);
            break;
        case GAME_STATE_PAUSED:
            updateGameState(GAME_STATE_RUNNING);
            break;
        case GAME_STATE_START:
            break;
        case GAME_STATE_GAME_OVER:
            break;
    }
}

// Takes game inputs from the keyboard
// Also prevents default actions for certain keys
document.addEventListener('keydown', event => {
    let newDirection = 'none';
    switch (event.key) {
        case ' ':
        case 'Escape':
            event.preventDefault();
            togglePause();
            return;
        case 'ArrowUp':
        case 'k':
        case 'w':
            event.preventDefault();
            newDirection = 'up';
            break;
        case 'ArrowDown':
        case 'j':
        case 's':
            event.preventDefault();
            newDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'h':
        case 'a':
            event.preventDefault();
            newDirection = 'left';
            break;
        case 'ArrowRight':
        case 'l':
        case 'd':
            event.preventDefault();
            newDirection = 'right';
            break;
    }
    if (gameState === GAME_STATE_RUNNING) {
        inputs.enqueue(newDirection);
    }
});


/* Determine inputs by swiping on mobile */

/**
 * Stores the coordinates of a touch event.
 * @typedef {Object} TouchCoordinates
 * @property {number|null} x - The x-coordinate of the touch position, or null if not set.
 * @property {number|null} y - The y-coordinate of the touch position, or null if not set.
 */

/**
 * Object to store the starting coordinates of a touch event.
 * @type {TouchCoordinates}
 */
let touchStart = {
    x: null,
    y: null,
}

/**
 * Object to store the current coordinates of a touch event.
 * @type {TouchCoordinates}
 */
let touchCurr = {
    x: null,
    y: null,
}

/**
 * Object to store the last coordinates of a touch event.
 * @type {TouchCoordinates}
 */
let touchEnd = {
    x: null,
    y: null,
}

/**
 * Reset all touch values to null.
 */
function resetTouches() {
    touchStart.x = null;
    touchStart.y = null;
    touchCurr.x = null;
    touchCurr.y = null;
    touchEnd.x = null;
    touchEnd.y = null;
}

/*
 * To reduce the number of accidental pauses, we track the start and end
 * location of a touch, and only pause if the touch starts and ends on the
 * pause button. 
 */

/** @constant {string} */
const PAUSE_DETECTION_WAITING = 'waiting';
/** @constant {string} */
const PAUSE_DETECTION_NOT_WAITING = 'not waiting';

/** @type {string} */
let pauseDetectionState = PAUSE_DETECTION_NOT_WAITING;

/**
 * @typedef {Object} Bounds
 * @property {number} top - The top of the bounds.
 * @property {number} bottom - The bottom of the bounds.
 * @property {number} left - The left of the bounds.
 * @property {number} right - The right of the bounds.
 */

/**
 * Bounds of pause button to track pauses and motions on same touches
 * @constant {Bounds}
 */
const pauseButtonBounds = pauseButton.getBoundingClientRect();

/**
 * Handles the 'touchstart' event on the window.
 * Used for tracking swipes for movement and for pause button presses.
 */
window.addEventListener('touchstart', (event) => {
    if (gameState !== GAME_STATE_RUNNING) {
        return;
    }

    event.preventDefault();
    const touch = event.touches[0];
    touchStart.x = touch.clientX;
    touchStart.y = touch.clientY;

    if (isInBounds(touchStart.x, touchStart.y, pauseButtonBounds)) {
        pauseDetectionState = PAUSE_DETECTION_WAITING;
    } else {
        pauseDetectionState = PAUSE_DETECTION_NOT_WAITING;
    }
}, { passive: false });

/**
 * Handles the 'touchmove' event on the window.
 * Tracks the current position of user touch in the running game state.
 */
window.addEventListener('touchmove', (event) => {
    if (gameState !== GAME_STATE_RUNNING) {
        return;
    }

    if (event.touches.length > 0) {
        touchCurr.x = event.touches[0].clientX;
        touchCurr.y = event.touches[0].clientY;
    }
});

/**
 * Handles the 'touchend' event on the window.
 * Translates touch movement to directional input, or toggles pause.
 */
window.addEventListener('touchend', (event) => {
    if (gameState === GAME_STATE_START || gameState === GAME_STATE_GAME_OVER) {
        return;
    }

    event.preventDefault();
    const touch = event.changedTouches[0];
    touchEnd.x = touch.clientX;
    touchEnd.y = touch.clientY;

    if (gameState === GAME_STATE_RUNNING) {
        if (isInBounds(touchEnd.x, touchEnd.y, pauseButtonBounds) && 
            pauseDetectionState === PAUSE_DETECTION_WAITING) {
            togglePause();
        } else {
            // Else, take the touch to be a swipe for movement
            inputs.enqueue(resolveDirection(touchStart, touchEnd));
        }
    } else if (gameState === GAME_STATE_PAUSED &&
        isInBounds(touchEnd.x, touchEnd.y, pauseButtonBounds)) {
        // If game is paused, unpause if touch ends on pause button
        togglePause();
    }

    // Reset variable to be reassigned on next pause touch
    pauseDetectionState = PAUSE_DETECTION_NOT_WAITING;
});

/**
 * Determines if the given coordinates are within the given bounds.
 * @param {number} x - The x coordinate of the location to check.
 * @param {number} y - The y coordinate of the location to check.
 * @param {Bounds} bounds - The bounds in which the coordinates are checked.
 * @returns {boolean} True if the coordinates are in the bounds, else false.
 */
function isInBounds(x, y, bounds) {
    return (x <= bounds.right && x >= bounds.left && y >= bounds.top && y <= bounds.bottom);
}

/**
 * Determines the direction of a swipe based on first and last touch.
 * @param {TouchCoordinates} touchInit - The coordinates of the starting touch.
 * @param {TouchCoordinates} touchFinal - The coordinates of the last touch.
 * @param {number} scaler - Option to scale swipe threshold, default is 1.
 * @returns {boolean} Direction of swipe, or 'none' if swipe is too small or input isn't proper.
 */
function resolveDirection(touchInit, touchFinal, scaler=1) {
    // Not sure why this is necessary
    for (const touch of [touchInit, touchFinal]) {
        for (const [_, value] of Object.entries(touch)) {
            if (value === null) {
                return 'none';
            }
        }
    }
    const deltaX = touchFinal.x - touchInit.x;
    const deltaY = touchFinal.y - touchInit.y;

    // This was an attempt to introduce a derivative controller to give more
    // weight to higher velocity, but does not work as currently implemented as
    // touchmove updates at equal distance (1), so touchVelocity is not useful.
    /*Object.keys(touchVelocity).forEach((key) => {
        console.log(`touchVelocity ${key}: ${touchVelocity[key]}`);
        if(touchVelocity[key] === null) {
            touchVelocity[key] = 1;
        }
        console.log(`touchVelocity ${key}: ${touchVelocity[key]}`);
    });*/

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD * scaler) {
        return 'none';
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            return 'right';
        } else {
            return 'left';
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            return 'down';
        } else {
            return 'up';
        }
    }
}

/**
 * Handles the 'click' event on the pause button.
 * Toggles the game state between paused and running.
 */
pauseButton.addEventListener('click', function() {
    togglePause();
});

/**
 * Handles the 'click' event on the start button.
 * Starts or restarts the game.
 */
startButton.addEventListener('click', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        resetGame();
    }
    updateGameState(GAME_STATE_RUNNING);
});

/**
 * Handles the 'touchend' event on the start button.
 * Starts or restarts the game.
 */
startButton.addEventListener('touchend', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        resetGame();
    }
    updateGameState(GAME_STATE_RUNNING);
});

/**
 * Handles the 'click' event on the share button.
 * Copies emoji version of most recent grid state to user clipboard.
 */
shareButton.addEventListener('click', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        navigator.clipboard.writeText(gridToText());

        alert("Copied score to clipboard!");
    }
});

/**
 * Handles the 'touchend' event on the share button.
 * Copies emoji version of most recent grid state to user clipboard.
 */
shareButton.addEventListener('touchend', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        navigator.clipboard.writeText(gridToText());

        alert("Copied score to clipboard!");
    }
});

