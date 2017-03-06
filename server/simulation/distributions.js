"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Units;
(function (Units) {
    Units[Units["Minute"] = 0] = "Minute";
    Units[Units["Hour"] = 1] = "Hour";
    Units[Units["Day"] = 2] = "Day";
    Units[Units["Week"] = 3] = "Week";
    Units[Units["Year"] = 4] = "Year";
})(Units = exports.Units || (exports.Units = {}));
var Distributions;
(function (Distributions) {
    Distributions[Distributions["Constant"] = 0] = "Constant";
    Distributions[Distributions["Exponential"] = 1] = "Exponential";
    Distributions[Distributions["Triangular"] = 2] = "Triangular";
})(Distributions = exports.Distributions || (exports.Distributions = {}));
class Distribution {
    constructor(type = Distributions.Constant, scale = Units.Minute, param1 = 0, param2 = 0, param3 = 0, value = 0) {
        this.type = type;
        this.value = value;
        this.param1 = param1;
        this.param2 = param2;
        this.param3 = param3;
    }
}
exports.Distribution = Distribution;
//# sourceMappingURL=distributions.js.map