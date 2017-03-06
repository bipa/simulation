"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("./queue");
const abstractQueue_1 = require("./abstractQueue");
class FifoQueue extends abstractQueue_1.AbstractQueue {
    constructor(sim, name = null) {
        super(sim, name);
        this.queue = new queue_1.Queue();
    }
    _innerEnqueue(item) {
        this.queue.enqueue(item);
    }
    _innerDequeue() {
        return this.queue.dequeue();
    }
    _innerLength() {
        return this.queue.length;
    }
    _innerPeek() {
        return this.queue.peek();
    }
}
exports.FifoQueue = FifoQueue;
//# sourceMappingURL=fifoQueue.js.map