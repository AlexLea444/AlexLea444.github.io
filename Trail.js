class TrailSegment {
    constructor(location) {
        this.x = location.x;
        this.y = location.y;
        this.color = 'green';
    }
  
    // Copy constructor
    copy() {
        return new TrailSegment(this.x, this.y);
    }
}

class Trail {
    constructor(head) {
        this.items = new Array(head);
        this.color = head.color;
    }
  
    // Function to add element to the queue
    enqueue(element) {
        this.items.push(element);
    }
  
    // Function to remove element from the queue
    dequeue() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.items.shift();
    }

    // Function to get last element from the queue
    last() {
        return this.items[0];
    }
  
    // Function to check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }
  
    // Function to get the length of the queue
    length() {
        return this.items.length;
    }
  
    // Simple iterator implementation
    *[Symbol.iterator]() {
        for (let item of this.items) {
            yield item;
        }
    }

    // Function to search for a value in the queue
    search(location) {
        for (let segment of this) {
            if (segment.x == location.x && segment.y == location.y) {
                return true;
            }
        }
        return false;
    }
}

class Player {
    constructor(numCols, numRows) {
        this.x = Math.floor((Math.random() + 1) * numCols / 8);
        this.y = Math.floor((Math.random() + 1) * numRows / 8);
        this.dx = 1;
        this.dy = 0;
    }

    location() {
        return {x: this.x,
                y: this.y,}
    }
}

export {TrailSegment, Trail, Player};
