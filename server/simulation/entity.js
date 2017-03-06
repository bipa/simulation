"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("./queues/queue");
let EventEmitter = require('events');
class Entity {
    constructor(entityModel) {
        this.timeEntered = 0;
        this.timeLeft = 0;
        this.duration = 0;
        this.type = entityModel.type;
        if (entityModel.name) {
            this.name = entityModel.name + Entity.count;
        }
        else {
            this.name = entityModel.name || entityModel.type + Entity.count;
        }
        Entity.count++;
        this.emitter = new EventEmitter();
    }
    dispose(time) {
        this.timeLeft = time;
        this.duration = this.timeLeft - this.timeEntered;
    }
}
Entity.count = 0;
exports.Entity = Entity;
class EntityQueue extends queue_1.Queue {
}
exports.EntityQueue = EntityQueue;
//# sourceMappingURL=entity.js.map