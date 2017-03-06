"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QueueTypes;
(function (QueueTypes) {
    QueueTypes[QueueTypes["fifo"] = 0] = "fifo";
    QueueTypes[QueueTypes["filo"] = 1] = "filo";
    QueueTypes[QueueTypes["priority"] = 2] = "priority";
})(QueueTypes = exports.QueueTypes || (exports.QueueTypes = {}));
class Queue {
    constructor() {
        this.head = [];
        this.tail = [];
        this.index = 0;
        this.headLength = 0;
        this.length = 0;
    }
    leave(item) {
    }
    enqueue(item) {
        this.push(item);
    }
    peek() {
        if (this.index >= this.headLength) {
            // When the head is empty, swap it with the tail to get fresh items.
            var t = this.head;
            t.length = 0;
            this.head = this.tail;
            this.tail = t;
            this.index = 0;
            this.headLength = this.head.length;
            if (!this.headLength) {
                return;
            }
        }
        // There was an item in the head, let's pull it out.
        var value = this.head[this.index];
        return value;
    }
    dequeue() {
        return this.shift();
    }
    // Get an item from the front of the queue.
    shift() {
        if (this.index >= this.headLength) {
            // When the head is empty, swap it with the tail to get fresh items.
            var t = this.head;
            t.length = 0;
            this.head = this.tail;
            this.tail = t;
            this.index = 0;
            this.headLength = this.head.length;
            if (!this.headLength) {
                return;
            }
        }
        // There was an item in the head, let's pull it out.
        var value = this.head[this.index];
        // And remove it from the head
        if (this.index < 0) {
            delete this.head[this.index++];
        }
        else {
            this.head[this.index++] = undefined;
        }
        this.length--;
        return value;
    }
    ;
    // Insert a new item at the front of the queue.
    unshift(item) {
        this.head[--this.index] = item;
        this.length++;
        return this;
    }
    ;
    // Push a new item on the end of the queue.
    push(item) {
        // Pushes always go to the write-only tail
        this.length++;
        this.tail.push(item);
        return this;
    }
    ;
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map