"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("./queues/queue");
const fifoQueue_1 = require("./queues/fifoQueue");
const resource_1 = require("./resource");
let EventEmitter = require('events');
class Process {
    constructor(simulation, processModel, resources = null, numberOfResourcesToSeize = 1, queueType = queue_1.QueueTypes.fifo) {
        switch (queueType) {
            case queue_1.QueueTypes.fifo:
                this.queue = new fifoQueue_1.FifoQueue(simulation);
                break;
            default:
                this.queue = new fifoQueue_1.FifoQueue(simulation);
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
            this.seizeFromResources(entity, simEvent);
        }
        else {
            //Listen for the one time the entity is in front....then seize
            this.eventEmitter.once(entity.name, () => {
                this.seizeFromResources(entity, simEvent);
            });
        }
        return simEvent;
    }
    seizeFromResources(entity, simEvent) {
        let idleResources = this.resources.filter(r => { return r.state === resource_1.ResourceStates.idle; });
        if (idleResources && idleResources.length > 0) {
            let resource = this.resources[0];
            resource.seize(entity);
            simEvent.result = new SeizeResult(entity, resource);
            this.simulation.scheduleEvent(simEvent, 0, `${entity.name} seized by ${this.resources[0].name}`);
            this.dequeue();
        }
        else {
            this.resources.forEach(r => {
                return this.inner_seize(entity, r, simEvent);
            });
        }
    }
    inner_seize(entity, r, simEvent) {
        r.emitter.once("idle", resource => {
            if (!simEvent.isScheduled) {
                resource.seize(entity);
                simEvent.result = new SeizeResult(entity, resource);
                this.simulation.scheduleEvent(simEvent, 0, `${entity.name} seized by ${this.resources[0].name}`);
                this.dequeue();
            }
        });
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
        return this.simulation.setTimer(processTime, this.name, `${entity.name} processed by ${resource.name}`);
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
//# sourceMappingURL=process1.js.map