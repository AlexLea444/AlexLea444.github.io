let validInputs = ['up', 'down', 'left', 'right'];

class InputsList {
    constructor() {
        this.items = [];
    }

    clear() {
        this.items = [];
    }
  
    // Function to add element to the queue
    enqueue(direction) {
        if (validInputs.indexOf(direction) !== -1) {
            this.items.push(direction);
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

export {InputsList, validInputs};
