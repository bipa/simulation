"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityStats {
    constructor(type) {
        //Time Stats
        this.totalTime = 0;
        this.transferTime = 0;
        this.valueAddedTime = 0;
        this.nonValueAddedTime = 0;
        this.waitTime = 0;
        this.otherTime = 0;
        //count stats
        this.numberIn = 0;
        this.numberOut = 0;
        this.type = type;
    }
}
exports.EntityStats = EntityStats;
//# sourceMappingURL=entityStats.js.map