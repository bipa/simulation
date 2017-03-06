"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let EventEmitter = require('events');
class Entity {
    constructor(entityModel) {
        this.timeEntered = 0;
        this.timeLeft = 0;
        this.duration = 0;
        this.transferTime = 0;
        this.valueAddedTime = 0;
        this.type = entityModel.type;
        this.speed = entityModel.speed;
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
//# sourceMappingURL=entity.js.map