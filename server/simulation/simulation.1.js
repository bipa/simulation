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
const entity_1 = require("./model/entity");
const resource_1 = require("./model/resource");
const priorityQueue_1 = require("./queues/priorityQueue");
const random_1 = require("./stats/random");
const simEvent_1_1 = require("./simEvent.1");
const process_1_1 = require("./tasks/process.1");
const distributions_1 = require("./stats/distributions");
const EventEmitter = require('events');
class Simulation {
    constructor(model) {
        this.useLogging = model.useLogging || false;
        this.random = new random_1.Random(model.preferences.seed);
        this.baseUnit = model.preferences.baseUnit || distributions_1.Units.Minute;
        this.simTime = 0;
        this.entities = new Set();
        this.resources = [];
        this.endTime = model.preferences.simTime || 1000;
        this.processes = [];
        this.queue = new priorityQueue_1.PriorityQueue((queueItem1, queueItem2) => { return queueItem1.deliverAt < queueItem2.deliverAt; });
        this.runtime = {};
        this.logRecords = [];
        this.simulationRecords = [];
        this.logger = this.defaultLogger;
        this.reporter = this.defaultReporter;
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(100);
        this.data = Object.assign({}, model.data);
        this.variables = {};
        this.createVariables(model.variables, this);
        this.eventCount = 0;
        this.unscheduledEvents = new Map();
        this.concurrentEvents = [];
        this.createResources(model.resources);
        this.createProcesses(model.processes);
        this.createEntities(model.entities);
    }
    defaultLogger(message) {
        if (this.useLogging)
            console.log(message);
    }
    defaultReporter(message) {
        console.log(message || "");
    }
    time() {
        return this.simTime;
    }
    scheduleEvent(simEvent, duration, message = null) {
        simEvent.deliverAt = this.time() + duration;
        //simEvent.scheduledAt = this.time();
        simEvent.message = message;
        simEvent.isScheduled = true;
        this.queue.add(simEvent);
        this.unscheduledEvents.delete(simEvent.id);
        this.concurrentEvents.push(simEvent.promise);
    }
    setTimer(duration = null, type = null, message = null) {
        let simEvent = null;
        if (duration) {
            simEvent = new simEvent_1_1.SimEvent(this.time(), this.time() + duration, type, message);
            simEvent.isScheduled = true;
            this.queue.add(simEvent);
        }
        else {
            simEvent = new simEvent_1_1.SimEvent(this.time(), this.time(), type, message);
            this.unscheduledEvents.set(simEvent.id, simEvent);
        }
        let p = new Promise((resolve, reject) => {
            this.eventEmitter.once(simEvent.name, (event) => {
                resolve(event);
            });
        }).then(e => {
            return simEvent;
        });
        simEvent.promise = p;
        if (simEvent.isScheduled && simEvent.deliverAt === this.simTime) {
            this.concurrentEvents.push(simEvent.promise);
        }
        return simEvent;
    }
    nextStep() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queue.size === 0) {
                this.finalize();
                this.eventEmitter.emit("done", true);
                return;
            }
            let event = this.queue.poll();
            this.simTime = event.deliverAt;
            if (event.deliverAt > this.endTime) {
                this.finalize();
                this.eventEmitter.emit("done", true);
                return;
            }
            ;
            this.eventCount++;
            this.simTime = event.deliverAt;
            this.log(event.message, event.type);
            //if(this.eventCount>1)
            this.eventEmitter.emit(event.name, event);
            /*this.log(`Count simulation listeners EVENTACTIVE:  ${this.eventEmitter.listenerCount("eventActive")}`,)
            this.log(`Count process listeners QUEUECHANGED:  ${this.processes[0].eventEmitter.listenerCount("queueChanged")}`,)
            this.log(`Count resource listeners IDLE:  ${this.resources[0].emitter.listenerCount("idle")}`,)*/
            //event.deliver();
            //let res = await event.promise;
            if (this.concurrentEvents.length > 0) {
                let r = yield Promise.all(this.concurrentEvents);
                this.concurrentEvents.length = 0;
                this.nextStep();
            }
            else {
                let res = yield event.promise;
                this.nextStep();
            }
        });
    }
    simulate(endTime = null, maxEvents = Number.POSITIVE_INFINITY) {
        let promise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.eventEmitter.once("done", (success) => {
                resolve(success);
            });
            this.eventCount = 0;
            this.endTime = endTime || this.endTime;
            this.nextStep();
        }));
        return promise;
    }
    /* simulate(endTime, maxEvents = Number.POSITIVE_INFINITY ) {
            // argCheck(arguments, 1, 2);
        let events = 0;
        this.endTime = endTime || this.endTime;
    
        while (true) {  // eslint-disable-line no-constant-condition
          events++;
          if (events > maxEvents) return false;
    
          if(this.queue.size ===0 ) break;
                // Get the earliest event
          const ro = this.queue.poll();
    
              
                // Uh oh.. we are out of time now
          if (ro.deliverAt > this.endTime) break;
    
                // Advance simulation time
          this.simTime = ro.deliverAt;
    
                // If this event is already cancelled, ignore
         // if (ro.cancelled) {ro.reject(this); continue;}
    
          this.eventEmitter.emit("eventActive", ro);
        }
    
        this.finalize();
        return true;
      }
    */
    finalize() {
        this.entities.forEach(entity => {
            if (entity.finalize) {
                entity.finalize();
            }
        });
        this.processes.forEach(p => {
            p.finalize();
            this.reportProcess(p);
        });
    }
    dispose(entity) {
        //keep some stats here
        entity.dispose(this.time());
        this.runtime[entity.type].dispose(entity);
        this.entities.delete(entity);
    }
    addRandomValue(dist) {
        if (dist === null)
            return dist;
        //if dist is just a number, following the default scale
        // if(!(dist instanceof Object) && !(parseInt(dist).isNaN())) return dist;
        let scale = this.setTimeScale(dist.unit || this.baseUnit);
        let value = null;
        switch (dist.type) {
            case distributions_1.Distributions.Constant:
                value = dist.param1 * scale;
                break;
            case distributions_1.Distributions.Exponential:
                value = this.random.exponential(1.0 / (dist.param1 * scale));
                break;
            case distributions_1.Distributions.Triangular:
                value = this.random.triangular(dist.param1 * scale, dist.param2 * scale, dist.param3 * scale);
                break;
            default:
                break;
        }
        return value;
    }
    //Should be put private
    setTimeScale(unit) {
        switch (unit) {
            case distributions_1.Units.Minute:
                return 1;
            case distributions_1.Units.Hour:
                return 60;
            case distributions_1.Units.Day:
                return 60 * 24;
            case distributions_1.Units.Week:
                return 7 * 60 * 24;
            default:
            case distributions_1.Units.Minute:
                return 1;
        }
    }
    createProcesses(processModels) {
        processModels.forEach(processModel => {
            let process = new process_1_1.Process(this, processModel);
            this.runtime[processModel.name] = process;
            this.processes.push(process);
        });
    }
    //Create Entities
    createEntities(entityModels) {
        entityModels.forEach(entityModel => {
            this.runtime[entityModel.type] = new EntityStats();
            this.setConventions(entityModel);
            this.scheduleNextCreation(entityModel);
        });
    }
    scheduleNextCreation(entityModel) {
        return __awaiter(this, void 0, void 0, function* () {
            let createAt = this.addRandomValue(entityModel.creation.dist);
            this.setTimer(createAt, "creation", entityModel.name).promise.then((simEvent) => {
                this.createModel(entityModel);
            });
        });
    }
    setConventions(entityModel) {
        if (!entityModel.creation) {
            entityModel.creation = {
                dist: {
                    value: 0
                },
                runOnce: true
            };
        }
        else {
            if (entityModel.creation.dist == null)
                entityModel.creation.dist = { value: 0 };
            if (entityModel.creation.runOnce == null)
                entityModel.creation.runOnce = false;
            if (entityModel.creation.runBatch == null && !entityModel.creation.batchsize)
                entityModel.creation.batchsize = 1;
        }
    }
    createModel(entityModel) {
        return __awaiter(this, void 0, void 0, function* () {
            this.createEntityInstance(entityModel);
            if (!entityModel.creation.runOnce) {
                if (entityModel.creation.repeatInterval) {
                    let repeatInterval = this.addRandomValue(entityModel.creation.repeatInterval);
                    this.setTimer(repeatInterval, "creation", entityModel.name).promise.then((simEvent) => {
                        this.createModel(entityModel);
                    });
                }
                else {
                    this.scheduleNextCreation(entityModel);
                }
            }
        });
    }
    createEntityInstance(entityModel) {
        if (entityModel.creation.runBatch) {
            let modelInstances = [];
            for (let i = 0; i < entityModel.creation.batchSize; i++) {
                this.entities.add(this.createSingleItem(entityModel));
            }
        }
        else {
            this.entities.add(this.createSingleItem(entityModel));
        }
    }
    createSingleItem(entityModel) {
        let entityInstance = new entity_1.Entity(entityModel);
        this.addEvents(entityModel, entityInstance);
        if (entityModel.creation.onCreateModel)
            entityModel.creation.onCreateModel(entityInstance, this);
        return entityInstance;
    }
    addEvents(entityModel, modelInstance) {
        //Should be SET AFTER the creation of an element
        if (entityModel.plannedEvents)
            entityModel.plannedEvents.forEach((plannedEvent) => __awaiter(this, void 0, void 0, function* () {
                // let plannedEvent = new PlannedEvent(e);
                // this.model.addPlannedEvent(plannedEvent);
                plannedEvent.logMessage = plannedEvent.logMessage || plannedEvent.name;
                let startTime = this.addRandomValue(plannedEvent.dist);
                yield this.setTimer(startTime).promise;
                this.schedulePlannedEvent(plannedEvent, modelInstance);
            }));
        if (entityModel.randomEvents)
            entityModel.randomEvents.forEach((randomEvent) => __awaiter(this, void 0, void 0, function* () {
                // let randomEvent = new RandomEvent(e);
                // this.model.addRandomEvent(randomEvent);
                randomEvent.logMessage = randomEvent.logMessage || randomEvent.name;
                if (randomEvent.numberOfRuns) {
                    let next = 0;
                    for (var i = 0; i < randomEvent.numberOfRuns; i++) {
                        next += this.addRandomValue(randomEvent.dist);
                        yield this.setTimer(next).promise;
                        this.randomEventOccured(randomEvent, modelInstance);
                    }
                }
                else {
                    let startTime = this.addRandomValue(randomEvent.dist);
                    yield this.setTimer(startTime).promise;
                    this.scheduleRandomEvent(randomEvent, modelInstance);
                }
            }));
    }
    schedulePlannedEvent(plannedEvent, modelInstance) {
        return __awaiter(this, void 0, void 0, function* () {
            //Schedule the next plannedEvent
            let repeatInterval = this.addRandomValue(plannedEvent.repeatInterval);
            let res = yield this.setTimer(repeatInterval).promise;
            this.schedulePlannedEvent(plannedEvent, modelInstance);
            //Log the execution of the planned event
            if (plannedEvent.logEvent)
                this.log(plannedEvent.logMessage);
            //Execute the planned event
            plannedEvent.action(modelInstance, this);
        });
    }
    scheduleRandomEvent(randomEvent, modelInstance) {
        return __awaiter(this, void 0, void 0, function* () {
            //Schedule the next plannedEvent
            let nextEventAt = this.addRandomValue(randomEvent.dist);
            this.randomEventOccured(randomEvent, modelInstance);
            let res = yield this.setTimer(nextEventAt).promise;
            this.scheduleRandomEvent(randomEvent, modelInstance);
        });
    }
    randomEventOccured(randomEvent, modelInstance) {
        if (randomEvent.logEvent)
            this.log(randomEvent.logMessage);
        randomEvent.action(modelInstance, this);
    }
    log(message, type = null, entity = null) {
        let newlogRec = {
            simTime: this.time(),
            name: message,
            message: message
        };
        this.logRecords.push(newlogRec);
        if (!this.logger)
            return;
        let entityMsg = '';
        if (type) {
            entityMsg = ` [${type}]`;
            /*if (entity.type) {
              entityMsg = ` [${entity.type}]`;
            }else {
              entityMsg = ` [${entity.id}] `;
            }*/
        }
        this.logger(`${this.simTime.toFixed(3)}${entityMsg}   ${message}`);
    }
    reportRecord(heading = null, statRecord = null) {
        if (heading) {
            this.reporter(heading);
            this.reporter();
        }
        if (statRecord) {
            this.reporter(`         Antall       : ${statRecord.count.toFixed(2)}`);
            this.reporter(`         Gjennomsnitt : ${statRecord.average.toFixed(2)}`);
            this.reporter(`         Max          : ${statRecord.max.toFixed(2)}`);
            this.reporter(`         Min          : ${statRecord.min.toFixed(2)}`);
            this.reporter(`         Variance     : ${statRecord.variance.toFixed(2)}`);
            this.reporter(`         Deviation    : ${statRecord.deviation.toFixed(2)}`);
            this.reporter(`         Sum          : ${statRecord.sum.toFixed(2)}`);
            this.reporter(`         Sum weighted : ${statRecord.sumWeighted.toFixed(2)}`);
        }
    }
    report() {
        this.processes.forEach(process => {
            this.reportProcess(process);
        });
    }
    reportProcess(process) {
        let processQueue = process.queue;
        this.reportRecord(processQueue.name);
        this.reportQueue(processQueue);
    }
    reportQueue(queue) {
        let recs = queue.report();
        this.reporter(`     Antall kommet           : ${queue.countEntered}`);
        this.reporter(`     Antall dratt            : ${queue.countLeft}`);
        this.reporter(`     Antall i kø nå          : ${queue.current}`);
        this.reportRecord("     Køens lengde            :", recs.sizeRecord);
        this.reporter();
        this.reportRecord("     Tid i køen              :", recs.durationRecord);
    }
    createResources(resourceModels) {
        resourceModels.forEach(resourceModel => {
            let resource = new resource_1.Resource(resourceModel);
            this.resources.push(resource);
            if (resourceModel.quantity === 1) {
                this.runtime[resourceModel.type] = resource;
            }
            ;
        });
    }
    createVariables(variables, ctx) {
        for (let variableName in variables) {
            if (Object.keys(variables[variableName]).length > 0) {
                this.variables[variableName] = {};
                for (let subVariableName in variables[variableName]) {
                    if (variableName == "noLog") {
                        this.variables[variableName][subVariableName] =
                            variables[variableName][subVariableName];
                    }
                    else {
                        this.createVariable(this.variables[variableName], subVariableName, variables[variableName][subVariableName], ctx);
                    }
                }
            }
            else {
                this.createVariable(this.variables, variableName, variables[variableName], ctx);
            }
        }
    }
    createVariable(obj, propName, initValue, ctx) {
        let vValue = initValue;
        Object.defineProperty(obj, propName, {
            get: function () { return vValue; },
            set: function (value) {
                vValue = value;
                ctx.simulationRecords.push(new SimulationRecord(ctx.time(), propName, value));
            }
        });
    }
}
exports.Simulation = Simulation;
class SimulationRecord {
    constructor(simTime, name, value) {
        this.simTime = simTime;
        this.name = name;
        this.value = value;
    }
}
exports.SimulationRecord = SimulationRecord;
class EntityStats {
    constructor() {
        this.count = 0;
        this.disposed = 0;
        this.inProgress = 0;
        this.maxTimeInSystem = 0;
        this.minTimeInSystem = 0;
        this.averageTimeInSystem = 0;
    }
    dispose(entity) {
        this.disposed++;
        this.averageTimeInSystem = (this.averageTimeInSystem * (this.disposed - 1) + entity.duration) / this.disposed;
        this.maxTimeInSystem = Math.max(this.maxTimeInSystem, entity.duration);
        this.minTimeInSystem = Math.min(this.minTimeInSystem, entity.duration);
        this.inProgress = this.count - this.disposed;
    }
    create(entity) {
        this.count++;
        this.inProgress = this.count - this.disposed;
    }
}
exports.EntityStats = EntityStats;
//# sourceMappingURL=simulation.1.js.map