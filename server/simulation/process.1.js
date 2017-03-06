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
const queue_1 = require("./queues/queue");
const fifoQueue_1_1 = require("./queues/fifoQueue.1");
const resource_1 = require("./resource");
let EventEmitter = require('events');
class Process {
    constructor(simulation, processModel, resources = null, numberOfResourcesToSeize = 1, queueType = queue_1.QueueTypes.fifo) {
        switch (queueType) {
            case queue_1.QueueTypes.fifo:
                this.queue = new fifoQueue_1_1.FifoQueue(simulation);
                break;
            default:
                this.queue = new fifoQueue_1_1.FifoQueue(simulation);
                break;
        }
        this.name = processModel.name;
        this.numberOfResourcesToSeize = numberOfResourcesToSeize;
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(100);
        this.resources = resources || new Array();
        this.simulation = simulation;
    }
    seize(entity, resource = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (resource && !this.resources.find(r => { return r.name === resource.name; })) {
                this.resources.push(resource);
            }
            let message = "";
            this.enqueue(entity);
            let seizeResult;
            //seize directly
            let simEvent = this.simulation.setTimer();
            simEvent.type = "seize";
            simEvent.result = seizeResult;
            if (this.queue.length == 1) {
                let idleResources = this.resources.filter(r => { return r.state === resource_1.ResourceStates.idle; });
                if (idleResources && idleResources.length > 0) {
                    let resource = this.resources[0];
                    let sResult = this.inner_seize(entity, resource, simEvent);
                    simEvent.result = sResult;
                }
                else {
                    this.resources.forEach(r => {
                        r.emitter.once("idle", resource => {
                            if (!simEvent.isScheduled) {
                                let sResult = this.inner_seize(entity, resource, simEvent);
                                simEvent.result = sResult;
                            }
                        });
                    });
                }
            }
            else {
                //Listen for the one time the entity is in front....then seize
                this.eventEmitter.once(entity.name, () => __awaiter(this, void 0, void 0, function* () {
                    let sResult = yield this.seizeFromResources(entity, simEvent);
                    simEvent.result = sResult;
                }));
            }
            return simEvent.promise;
        });
    }
    seizeFromResources(entity, simEvent) {
        let promise = new Promise((resolve, reject) => {
            let idleResources = this.resources.filter(r => { return r.state === resource_1.ResourceStates.idle; });
            if (idleResources && idleResources.length > 0) {
                let resource = this.resources[0];
                let sResult = this.inner_seize(entity, resource, simEvent);
                resolve(sResult);
            }
            else {
                this.resources.forEach(r => {
                    r.emitter.once("idle", resource => {
                        if (!simEvent.isScheduled) {
                            let sResult = this.inner_seize(entity, resource, simEvent);
                            resolve(sResult);
                        }
                    });
                });
            }
        });
        return promise;
    }
    inner_seize(entity, resource, simEvent) {
        resource.seize(entity);
        simEvent.result = new SeizeResult(entity, resource);
        this.simulation.scheduleEvent(simEvent, 0, `${this.resources[0].name} seized by ${entity.name}, now start processing`);
        this.dequeue();
        return simEvent.result;
    }
    enqueue(entity) {
        this.queue.enqueue(entity);
        this.simulation.log(`${entity.name} enqueued`, "enqueue");
        this.eventEmitter.emit("enqueued");
    }
    dequeue() {
        let entity = this.queue.dequeue();
        this.simulation.log(`${entity.name} dequeued`, "dequeue");
        if (this.queue.length > 0) {
            let nextEntity = this.queue.peek();
            this.eventEmitter.emit(nextEntity.name);
        }
    }
    leave(entity) {
        this.queue.leave(entity);
        this.eventEmitter.emit("queueChanged");
    }
    /* trySeizeFromMany(entity: Entity, resources: Resource[]): Promise<SeizeResult> {
         let promises: Promise<SeizeResult>[] = [];
         resources.forEach(resource => {
             let p = this.trySeize(entity, resource);
             promises.push(p);
         });
         return Promise.race(promises);
     }
 
 
 
     trySeize(entity, resource: Resource): Promise<SeizeResult> {
         let promise = new Promise((resolve, reject) => {
             if (resource.state === ResourceStates.idle) {
                 resolve(new SeizeResult(entity, [resource]));
             } else {
                 resource.emitter.once("idle", resource => {
                     resolve(new SeizeResult(entity, [resource]));
                 });
             }
 
         })
         return promise
     }*/
    process(entity, resource, processTimeDist) {
        let processTime = this.simulation.addRandomValue(processTimeDist);
        return this.simulation.setTimer(processTime, this.name, `${entity.name} processed by ${resource.name}`).promise;
    }
    release(entity, resource) {
        //resource becomese idle, seizedBy becomes null
        //Should have other statistics also here
        resource.release(entity);
    }
    finalize() {
        this.queue.finalize();
    }
}
exports.Process = Process;
class SeizeResult {
    constructor(entity, resource = null, resources = null) {
        this.entity = entity;
        this.resources = resources;
        this.resource = resource;
    }
}
exports.SeizeResult = SeizeResult;
//# sourceMappingURL=process.1.js.map