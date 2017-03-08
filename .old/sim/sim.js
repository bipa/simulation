// import { PQueue, Queue } from './queues.js';
// import { Population } from './stats.js';
// import { Request } from './request.js';
// import { Model } from './model.js';
"use strict";

var PQueue = require("./queues.js").PQueue;
var Facility = require("./facility.js").Facility;
var Queue = require("./queues.js").Queue;
var Population = require("./stats.js").Population;
var Request = require("./request.js").Request;
var Model = require("./model.js").Model;
var DataSeries = require("./stats.js").DataSeries;
var TimeSeries = require("./stats.js").TimeSeries;
var Random = require("./random.js").Random;
var argCheck = require("./argcheck.js");
var Buffer = require("./buffer.js");
var Store = require("./store.js");




class Sim {
  constructor() {
    this.simTime = 0;
    this.entities = [];
    this.queue = new PQueue();
    this.endTime = 0;
    this.entityId = 1;
  }

  time() {
    return this.simTime;
  }

  sendMessage() {
    const sender = this.source;

    const message = this.msg;

    const entities = this.data;

    const sim = sender.sim;

    if (!entities) {
            // send to all entities
      for (let i = sim.entities.length - 1; i >= 0; i--) {
        const entity = sim.entities[i];

        if (entity === sender) continue;
        if (entity.onMessage) entity.onMessage(sender, message);
      }
    } else if (entities instanceof Array) {
      for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];

        if (entity === sender) continue;
        if (entity.onMessage) entity.onMessage(sender, message);
      }
    } else if (entities.onMessage) {
      entities.onMessage(sender, message);
    }
  }

  addEntity(Klass, name, ...args) {
        // Verify that prototype has start function
    if (!Klass.prototype.start) {  // ARG CHECK
      throw new Error(`Entity class ${Klass.name} must have start() function defined`);
    }

    const entity = new Klass(this, name);

    this.entities.push(entity);

    entity.start(...args);

    return entity;
  }

  simulate(endTime, maxEvents) {
        // argCheck(arguments, 1, 2);
    if (!maxEvents) { maxEvents = Math.Infinity; }
    let events = 0;

    while (true) {  // eslint-disable-line no-constant-condition
      events++;
      if (events > maxEvents) return false;

            // Get the earliest event
      const ro = this.queue.remove();

            // If there are no more events, we are done with simulation here.
      if (ro === null) break;

            // Uh oh.. we are out of time now
      if (ro.deliverAt > endTime) break;

            // Advance simulation time
      this.simTime = ro.deliverAt;

            // If this event is already cancelled, ignore
      if (ro.cancelled) continue;

      ro.deliver();
    }

    this.finalize();
    return true;
  }

  step() {
    while (true) {  // eslint-disable-line no-constant-condition
      const ro = this.queue.remove();

      if (ro === null) return false;
      this.simTime = ro.deliverAt;
      if (ro.cancelled) continue;
      ro.deliver();
      break;
    }
    return true;
  }

  finalize() {
    for (let i = 0; i < this.entities.length; i++) {

      if (this.entities[i].finalize) {
        this.entities[i].finalize();
      }
    }
  }

  setLogger(logger) {
    argCheck(arguments, 1, 1, Function);
    this.logger = logger;
  }

  log(message, entity) {
    argCheck(arguments, 1, 2);

    if (!this.logger) return;
    let entityMsg = '';

    if (typeof entity !== 'undefined') {
      if (entity.name) {
        entityMsg = ` [${entity.name}]`;
      } else {
        entityMsg = ` [${entity.id}] `;
      }
    }
    this.logger(`${this.simTime.toFixed(0)}${entityMsg}   ${message}`);
  }
}



class Event extends Model {
  constructor(name) {
    super(name);
    argCheck(arguments, 0, 1);

    this.waitList = [];
    this.queue = [];
    this.isFired = false;
  }
  
  

  addWaitList(ro) {
    argCheck(arguments, 1, 1);

    if (this.isFired) {
      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);
      return;
    }
    this.waitList.push(ro);
  }

  addQueue(ro) {
    argCheck(arguments, 1, 1);

    if (this.isFired) {
      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);
      return;
    }
    this.queue.push(ro);
  }

  fire(keepFired) {
    argCheck(arguments, 0, 1);

    if (keepFired) {
      this.isFired = true;
    }

        // Dispatch all waiting entities
    const tmpList = this.waitList;

    this.waitList = [];
    for (let i = 0; i < tmpList.length; i++) {

      tmpList[i].deliver();
    }

        // Dispatch one queued entity
    const lucky = this.queue.shift();

    if (lucky) {
      lucky.deliver();
    }
  }

  clear() {
    this.isFired = false;
  }
}

class Entity extends Model {
  constructor(sim, name) {
    super(name);
    this.sim = sim;
  }

  time() {
    return this.sim.time();
  }

  setTimer(duration) {
    argCheck(arguments, 1, 1);

    const ro = new Request(
              this,
              this.sim.time(),
              this.sim.time() + duration);

    this.sim.queue.insert(ro);
    return ro;
  }

  waitEvent(event) {
    argCheck(arguments, 1, 1, Event);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = event;
    event.addWaitList(ro);
    return ro;
  }

  queueEvent(event) {
    argCheck(arguments, 1, 1, Event);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = event;
    event.addQueue(ro);
    return ro;
  }

  useFacility(facility, duration) {
    argCheck(arguments, 2, 2, Facility);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = facility;
    facility.use(duration, ro);
    return ro;
  }

  putBuffer(buffer, amount) {
    argCheck(arguments, 2, 2, Buffer);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = buffer;
    buffer.put(amount, ro);
    return ro;
  }

  getBuffer(buffer, amount) {
    argCheck(arguments, 2, 2, Buffer);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = buffer;
    buffer.get(amount, ro);
    return ro;
  }

  putStore(store, obj) {
    argCheck(arguments, 2, 2, Store);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = store;
    store.put(obj, ro);
    return ro;
  }

  getStore(store, filter) {
    argCheck(arguments, 1, 2, Store, Function);

    const ro = new Request(this, this.sim.time(), 0);

    ro.source = store;
    store.get(filter, ro);
    return ro;
  }

  send(message, delay, entities) {
    argCheck(arguments, 2, 3);

    const ro = new Request(this.sim, this.time(), this.time() + delay);

    ro.source = this;
    ro.msg = message;
    ro.data = entities;
    ro.deliver = this.sim.sendMessage;

    this.sim.queue.insert(ro);
  }

  log(message) {
    argCheck(arguments, 1, 1);

    this.sim.log(message, this);
  }
}

//export { Sim, Facility, Buffer, Store, Event, Entity, argCheck };

module.exports.Sim = Sim;
module.exports.Facility = Facility;
module.exports.Buffer = Buffer;
module.exports.Store = Store;
module.exports.Event = Event;
module.exports.Entity = Entity;
module.exports.argCheck = argCheck;
module.exports.DataSeries = DataSeries;
module.exports.TimeSeries = TimeSeries;
module.exports.Population = Population;
module.exports.Request = Request;
module.exports.Random = Random;
module.exports.Queue = Queue;