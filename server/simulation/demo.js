"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simulation_1 = require("./simulation");
const distributions_1 = require("./stats/distributions");
let data = {}; //don't remove this line
let constants = {}; //don't remove this line
data.partArrivalDist = { type: distributions_1.Distributions.Exponential, param1: 5 };
data.machineProcessTime = { type: distributions_1.Distributions.Triangular, param1: 3, param2: 5, param3: 7.5 };
let model = {
    data: data,
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
                onCreateModel: (part, ctx) => {
                    let simEvent = ctx.runtime.processPart.seize(part, ctx.runtime.machine).done(() => {
                        ctx.runtime.processPart.process(part, simEvent.result.resource, ctx.data.machineProcessTime).done(() => {
                            ctx.runtime.processPart.release(part, simEvent.result.resource);
                            ctx.dispose(part);
                        });
                    });
                }
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
        seed: 1234
    };
}
let simulation = new simulation_1.Simulation(model);
simulation.simulate(1000);
//# sourceMappingURL=demo.js.map