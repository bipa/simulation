"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stats_1 = require("../stats/stats");
class AbstractQueue {
    constructor(sim, name = null) {
        this.sim = sim;
        this.timeStamps = new Map();
        this.stats = new stats_1.Population();
        this.name = name || "queue" + AbstractQueue.count;
        this.countEntered = 0;
        this.countLeft = 0;
        this.current = 0;
    }
    enqueue(item) {
        let timeStamp = this.sim.simTime;
        this.timeStamps.set(item, timeStamp);
        this._innerEnqueue(item);
        this.stats.enter(timeStamp);
        this.countEntered++;
        this.current++;
    }
    dequeue() {
        let item = this._innerDequeue();
        let timeStamp = this.timeStamps.get(item);
        let simTime = this.sim.simTime;
        this.stats.leave(timeStamp, simTime);
        this.countLeft++;
        this.current--;
        return item;
    }
    peek() {
        return this._innerPeek();
    }
    get length() {
        return this._innerLength();
    }
    leave(item) {
        this._innerLeave();
    }
    _innerLeave() {
        throw ("not implemented - this method MUST be overriden");
    }
    _innerPeek() {
        throw ("not implemented - this method MUST be overriden");
    }
    _innerLength() {
        throw ("not implemented - this method MUST be overriden");
    }
    _innerEnqueue(item) {
        throw ("not implemented - this method MUST be overriden");
    }
    _innerDequeue() {
        throw ("not implemented - this method MUST be overriden");
    }
    report() {
        return this.stats.report();
    }
    finalize() {
        this.stats.finalize(this.sim.simTime);
    }
}
AbstractQueue.count = 0;
exports.AbstractQueue = AbstractQueue;
//# sourceMappingURL=abstractQueue.js.map