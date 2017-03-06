"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = require("./entity");
class Resource extends entity_1.Entity {
    constructor(model) {
        super(model);
        this.processTime = model.processTime;
        this.state = ResourceStates.idle;
    }
    seize(entity) {
        this.state = ResourceStates.busy;
        this.seizedBy = entity;
        this.emitter.emit("busy", entity);
    }
    release(enitity) {
        this.state = ResourceStates.idle;
        this.seizedBy = null;
        this.emitter.emit("idle", this);
    }
}
exports.Resource = Resource;
var ResourceStates;
(function (ResourceStates) {
    ResourceStates[ResourceStates["idle"] = 0] = "idle";
    ResourceStates[ResourceStates["busy"] = 1] = "busy";
    ResourceStates[ResourceStates["broken"] = 2] = "broken";
})(ResourceStates = exports.ResourceStates || (exports.ResourceStates = {}));
//# sourceMappingURL=resource.js.map