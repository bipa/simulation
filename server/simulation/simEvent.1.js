"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SimEvent {
    constructor(scheduledAt, deliverAt, type, message) {
        this.isScheduled = false;
        this.deliverAt = deliverAt || Number.POSITIVE_INFINITY;
        this.scheduledAt = scheduledAt;
        this.cancelled = false;
        this.type = type;
        this.message = message;
        this.id = SimEvent.count;
        this.name = "event" + this.id;
        SimEvent.count++;
        this.callbacks = [];
    }
    deliver() {
        //The event should be executerd, this means that all listeners should be notified
        for (let i = 0; i < this.callbacks.length; i++) {
            this.callbacks[i]();
        }
    }
    done(onWhenDone, nextEvent = null) {
        this.callbacks.push(onWhenDone);
        return nextEvent || this;
    }
}
SimEvent.count = 0;
exports.SimEvent = SimEvent;
//# sourceMappingURL=simEvent.1.js.map