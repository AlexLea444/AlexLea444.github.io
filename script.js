import Apple from './Apple.js';
import {TrailSegment, Trail, Player} from './Trail.js';

// Get references to HTML elements
const gameCanvas = document.getElementById('gameCanvas');
const infoOverlay = document.getElementById('infoOverlay');
const ctx = gameCanvas.getContext('2d');
const pauseOverlay = document.getElementById('pauseOverlay');
const pauseButton = document.querySelector('.pauseButton');
const gameInfo = document.getElementById('gameInfo');
const gridInfo = document.getElementById('gridInfo');
const finalScore = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const shareButton = document.getElementById('shareButton');

// Constants for grid size and dimensions
const gridSize = 40; // Size of each grid cell
const numRows = gameCanvas.height / gridSize;
const numCols = gameCanvas.width / gridSize;
const gridBounds = {
    left: 0,
    right: numCols - 1,
    top: 0,
    bottom: numRows - 1,
}

// Load highscore from local storage
let highscore = localStorage.getItem('highscore');
if (highscore === null) {
    highscore = 0;
}

let player = new Player(numCols, numRows);

let trail = new Trail(new TrailSegment(player.location()));

let apple = new Apple(numCols, numRows);

let validInputs = ['up', 'down', 'left', 'right'];

class InputsList {
    constructor() {
        this.items = [];
    }

    clear() {
        this.items = [];
    }
  
    // Function to add element to the queue
    enqueue(element) {
        if (gameState !== GAME_STATE_RUNNING) {
            return;
        }
        if (validInputs.indexOf(element) !== -1) {
            this.items.push(element);
        }
    }
  
    // Function to remove element from the queue
    dequeue() {
        if (this.isEmpty()) {
            return 'Underflow';
        }
        return this.items.shift();
    }
  
    // Function to check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }
}

let inputs = new InputsList();

// Define constants for collision states
const COLLISION_STATE_WALL = 'the wall';
const COLLISION_STATE_TAIL = 'your tail';
const COLLISION_STATE_NONE = 'nothing';

// Initialize the current collision state
let collisionState = COLLISION_STATE_NONE;

// Used to update location of snake on regular interval
let moveIntervalId;

// Define constants for game states
const GAME_STATE_START = 'start';
const GAME_STATE_RUNNING = 'running';
const GAME_STATE_PAUSED = 'paused';
const GAME_STATE_GAME_OVER = 'game_over';

// Initialize the current game state
let gameState; 
updateGameState(GAME_STATE_START);

// Function to update the game state
function updateGameState(newState) {

    // Additional logic based on the new game state
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
            // Set an interval for the movePlayer function (every 120ms)
            moveIntervalId = setInterval(movePlayer, 170);

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
            if (score() > highscore) {
                gameInfo.innerHTML = `Game Over<br>New high score!`;
            } else {
                gameInfo.innerHTML = `Game Over<br>You hit ${collisionState}`;
            }
            gridInfo.innerHTML = gridToHTML();
            finalScore.textContent = `Final Score: ${score()}`;
            shareButton.style.display = "inline-block";
            startButton.textContent = "Restart";

            break;
        default:
            // Handle unexpected state
            break;
    }

    gameState = newState;
}

function gridToHTML() {
    let grid = "";
    for (let i = 0; i < numCols; i++) {
        for (let j = 0; j < numRows; j++) {
            let location = {x: j, y: i,};
            if (player.x === j && player.y === i) {
                grid = grid.concat("&#128165;");
            } else if (trail.search(location)) {
                grid = grid.concat("&#129001;");
            } else if (apple.x === j && apple.y === i) {
                grid = grid.concat("&#127822;");
            } else {
                grid = grid.concat("&#11036;")
            }
        }
        grid = grid.concat("<br>");
    }
    return grid;
}

function draw() {
    // Clear the gameCanvas
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw apple
    drawSquare(apple);

    // Draw grid
    drawGrid();

    // Draw trail
    drawTrail();

    document.getElementById('score').textContent = `Score: ${score()}`;
}

function drawSquare(square) {
    ctx.fillStyle = square.color;
    ctx.fillRect(square.x * gridSize, square.y * gridSize, gridSize, gridSize);
}

function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";
  
    // Draw vertical lines
    for (let i = 0; i <= numCols; i++) {
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, gameCanvas.height);
    }
  
    // Draw horizontal lines
    for (let j = 0; j <= numRows; j++) {
        ctx.moveTo(0, j * gridSize);
        ctx.lineTo(gameCanvas.width, j * gridSize);
    }
  
    ctx.stroke();
}

function drawTrail() {
    // First, draw a dark square around every segment of the trail
    ctx.beginPath();
    ctx.strokeStyle = "#222";

    for (let segment of trail) {
        drawSquare(segment);

        ctx.moveTo(segment.x * gridSize, segment.y * gridSize);

        ctx.lineTo((segment.x + 1) * gridSize, segment.y * gridSize);
        ctx.lineTo((segment.x + 1) * gridSize, (segment.y + 1) * gridSize);
        ctx.lineTo(segment.x * gridSize, (segment.y + 1) * gridSize);
        ctx.lineTo(segment.x * gridSize, segment.y * gridSize);

    }
    ctx.stroke();


    // Then, go back in and remove the lines between snake segments
    let prev = trail.last();

    ctx.beginPath();
    // Assume trail is all one color
    ctx.strokeStyle = 'green';

    for (const curr of trail) {
        if (curr.x === prev.x - 1) {
            // current segment is left of previous segment
            ctx.moveTo((curr.x + 1) * gridSize, curr.y * gridSize + 1);
            ctx.lineTo((curr.x + 1) * gridSize, (curr.y + 1) * gridSize - 1);
        } else if (curr.x === prev.x + 1) {
            // current segment is right of previous segment
            ctx.moveTo(curr.x * gridSize, curr.y * gridSize + 1);
            ctx.lineTo(curr.x * gridSize, (curr.y + 1) * gridSize - 1);
        } else if (curr.y === prev.y - 1) {
            // current segment is on top of previous segment
            ctx.moveTo(curr.x * gridSize + 1, (curr.y + 1) * gridSize);
            ctx.lineTo((curr.x + 1) * gridSize - 1, (curr.y + 1) * gridSize);
        } else if (curr.y === prev.y + 1) {
            // current segment is below previous segment
            ctx.moveTo(curr.x * gridSize + 1, curr.y * gridSize);
            ctx.lineTo((curr.x + 1) * gridSize - 1, curr.y * gridSize);
        }
        prev = curr;
    }
    ctx.stroke();
}

function movePlayer() {
    

    updateVelocity(inputs.dequeue());
  
    player.x += player.dx;
    player.y += player.dy;
  
    // Check if the new location is within bounds and not an obstacle
    if (isInBounds(player.x, player.y, gridBounds)) {
        if (trail.search(player.location())) {
            // Check that collision is not caused by trail segment which is
            // about to be dequeued
            let trailEnd = trail.last();
            if (player.x !== trailEnd.x || player.y !== trailEnd.y) {
                collisionState = COLLISION_STATE_TAIL;
            }
        }
  
        if (player.x === apple.x && player.y === apple.y) {
            apple.moveNotTo(trail);
        } else if (collisionState === COLLISION_STATE_NONE) {
            trail.dequeue();
        }
    } else {
        player.x -= player.dx;
        player.y -= player.dy;
        collisionState = COLLISION_STATE_WALL;
    }
 
    if (collisionState === COLLISION_STATE_NONE) {
        trail.enqueue(new TrailSegment(player.location()));
        draw();
    } else {
        updateGameState(GAME_STATE_GAME_OVER);
    }
}

function score() {
    if (trail.length() === (numCols * numRows - 1) && gameState === GAME_STATE_RUNNING) {
        updateGameState(GAME_STATE_GAME_OVER);
    } else {
        return trail.length();
    }
}

function resetGame() {
    collisionState = COLLISION_STATE_NONE;
    highscore = Math.max(highscore, score());
    localStorage.setItem('highscore', highscore);
    player = new Player(numCols, numRows);
    trail = new Trail(new TrailSegment(player.location()));
    apple.moveNotTo(trail);
    resetTouches();
    draw();
}

function updateVelocity(direction) {
    if (direction === 'up') {
        if (player.dx !== 0) {
            player.dy = -1;
            player.dx = 0;
        }
    } else if (direction === 'down') {
        if (player.dx !== 0) {
            player.dy = 1;PAUSE_DETECTION_NOT_WAITING
            player.dx = 0;
        }
    } else if (direction === 'left') {
        if (player.dy !== 0) {
            player.dx = -1;
            player.dy = 0;
        }
    } else if (direction === 'right') {
        if (player.dy !== 0) {
            player.dx = 1;
            player.dy = 0;
        }
    } else if (direction === 'Underflow') {
        // No input from input list, so we can check if the user is swiping
        const newDirection = resolveDirection(touchStart, touchCurr);
        if (validInputs.indexOf(newDirection) !== -1) {
            // Update starting points if a significant change was detected
            // Allows for finger held on screen, and prevents repeat inputs
            touchStart.x = touchCurr.x;
            touchStart.y = touchCurr.y;
        }
        updateVelocity(newDirection);
    }
}

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
    switch (event.key) {
        case ' ':
            event.preventDefault();
            togglePause();
            break;
        case 'Escape':
            event.preventDefault();
            togglePause();
            break;
        case 'ArrowUp':
            event.preventDefault();
            inputs.enqueue('up');
            break;
        case 'ArrowDown':
            event.preventDefault();
            inputs.enqueue('down');
            break;
        case 'ArrowLeft':
            event.preventDefault();
            inputs.enqueue('left');
            break;
        case 'ArrowRight':
            event.preventDefault();
            inputs.enqueue('right');
            break;
    }
});

/* Determine inputs by swiping on mobile */
let touchStart = {
    x: null,
    y: null,
}
let touchCurr = {
    x: null,
    y: null,
}
let touchEnd = {
    x: null,
    y: null,
}
let touchVelocity = {
    x: null,
    y: null,
}

function resetTouches() {
    touchStart.x = null;
    touchStart.y = null;
    touchCurr.x = null;
    touchCurr.y = null;
    touchEnd.x = null;
    touchEnd.y = null;
    touchVelocity.x = null;
    touchVelocity.y = null;
}

// To reduce the number of accidental pauses, we track the start and end
// location of a touch, and only pause if the touch starts and ends on the
// pause button. 
const PAUSE_DETECTION_WAITING = 'waiting';
const PAUSE_DETECTION_NOT_WAITING = 'not waiting';
let pauseDetectionState = PAUSE_DETECTION_NOT_WAITING;

// Track if touch started on pause button
const pauseButtonBounds = pauseButton.getBoundingClientRect();

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

window.addEventListener('touchmove', (event) => {
    if (gameState !== GAME_STATE_RUNNING) {
        return;
    }

    if (event.touches.length > 0) {
        touchVelocity.x = event.touches[0].clientX - touchCurr.x;
        touchVelocity.y = event.touches[0].clientY - touchCurr.y;
        touchCurr.x = event.touches[0].clientX;
        touchCurr.y = event.touches[0].clientY;
    }
});

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
            // Only pause if touch starts and ends in pause button
            togglePause();
        } else {
            // Else, take the touch to be a swipe for movement
            inputs.enqueue(resolveDirection(touchStart, touchEnd));
        }
    }

    if (gameState === GAME_STATE_PAUSED &&
        isInBounds(touchEnd.x, touchEnd.y, pauseButtonBounds)) {
        // If game is paused, unpause if touch ends on pause button
        togglePause();
    }

    // Reset variable to be reassigned on next pause touch
    pauseDetectionState = PAUSE_DETECTION_NOT_WAITING;
});

function isInBounds(x, y, bounds) {
    return (x <= bounds.right && x >= bounds.left && y >= bounds.top && y <= bounds.bottom);
}

function resolveDirection(touchInit, touchFinal) {
    // Not sure why this is necessary
    for (const touch of [touchInit, touchFinal]) {
        for (const [key, value] of Object.entries(touch)) {
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

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 30) {
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

pauseButton.addEventListener('click', function() {
    togglePause();
});

startButton.addEventListener('click', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        resetGame();
    }
    updateGameState(GAME_STATE_RUNNING);
});

startButton.addEventListener('touchend', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        resetGame();
    }
    updateGameState(GAME_STATE_RUNNING);
});

shareButton.addEventListener('click', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        const copyText = gridToHTML().replaceAll('<br>', '\n')
                                     .replaceAll('&#129001;',"🟩")
                                     .replaceAll('&#11036;', "⬜")
                                     .replaceAll('&#127822;', "🍎")
                                     .replaceAll('&#128165;', "💥")
                                     .concat(`\nscore: ${score()}`);
        navigator.clipboard.writeText(copyText);

        alert("Copied score to clipboard!");
    }
});

shareButton.addEventListener('touchend', function() {
    if (gameState === GAME_STATE_GAME_OVER) {
        const copyText = gridToHTML().replaceAll('<br>', '\n')
                                     .replaceAll('&#129001;',"🟩")
                                     .replaceAll('&#11036;', "⬜")
                                     .replaceAll('&#127822;', "🍎")
                                     .replaceAll('&#128165;', "💥")
                                     .concat(`\nscore: ${score()}`);
        navigator.clipboard.writeText(copyText);

        alert("Copied score to clipboard!");
    }
});

