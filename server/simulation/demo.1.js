"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const simulation_1_1 = require("./simulation.1");
const distributions_1 = require("./stats/distributions");
let data = {}; //don't remove this line
let constants = {}; //don't remove this line
data.partArrivalDist = { type: distributions_1.Distributions.Exponential, param1: 5 };
data.machineProcessTime = { type: distributions_1.Distributions.Exponential, param1: 3 };
let variables = {}; //don't remove this line - declaration
variables.kpi = {}; //don't remove this line - declaration
variables.kpi.queueLength = 0;
let model = {
    data: data,
    variables: variables,
    processes: getProcesses(),
    resources: getResources(),
    entities: getEntities(),
    preferences: getPreferences()
};
function getEntities() {
    return [
        {
            type: "part",
            name: "part",
            creation: {
                dist: data.partArrivalDist,
                onCreateModel: (part, ctx) => __awaiter(this, void 0, void 0, function* () {
                    let simEvent = yield ctx.runtime.processPart.seize(part, ctx.runtime.machine);
                    yield ctx.runtime.processPart.delay(part, simEvent.result.resource, ctx.data.machineProcessTime);
                    ctx.runtime.processPart.release(part, simEvent.result.resource);
                    ctx.dispose(part);
                })
            }
        }
    ];
}
function getProcesses() {
    return [
        {
            name: "processPart",
        }
    ];
}
function getResources() {
    return [
        {
            type: "machine",
            name: "machine1",
            quantity: 1,
        }
    ];
}
function getPreferences() {
    return {
        seed: 1234,
        simTime: 20000,
        useLogging: false
    };
}
function simulate() {
    return __awaiter(this, void 0, void 0, function* () {
        let simulation = new simulation_1_1.Simulation(model);
        yield simulation.simulate();
        let i = 0;
    });
}
simulate();
//# sourceMappingURL=demo.1.js.map