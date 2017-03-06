
var Model = require("./model.js").Model;
var argCheck = require("./argcheck.js");
var Request = require("./request.js").Request;
var Queue = require("./queues.js").Queue;
var Population = require("./stats.js").Population;







class Facility extends Model {
  constructor(name, discipline, servers, maxqlen) {
    super(name);
    argCheck(arguments, 1, 4);

    this.free = servers ? servers : 1;
    this.servers = servers ? servers : 1;
    this.maxqlen = (typeof maxqlen === 'undefined') ? -1 : 1 * maxqlen;

    switch (discipline) {

    case Facility.LCFS:
      this.use = this.useLCFS;
      this.queue = new Queue();
      break;
    case Facility.PS:
      this.use = this.useProcessorSharing;
      this.queue = [];
      break;
    case Facility.FCFS:
    default:
      this.use = this.useFCFS;
      this.freeServers = new Array(this.servers);
      this.queue = new Queue();
      for (let i = 0; i < this.freeServers.length; i++) {

        this.freeServers[i] = true;
      }
    }

    this.stats = new Population();
    this.busyDuration = 0;
  }

  reset() {
    this.queue.reset();
    this.stats.reset();
    this.busyDuration = 0;
  }

  systemStats() {
    return this.stats;
  }

  queueStats() {
    return this.queue.stats;
  }

  usage() {
    return this.busyDuration;
  }

  finalize(timestamp) {
    argCheck(arguments, 1, 1);

    this.stats.finalize(timestamp);
    this.queue.stats.finalize(timestamp);
  }

  useFCFS(duration, ro) {
    argCheck(arguments, 2, 2);
    if ((this.maxqlen === 0 && !this.free)
                || (this.maxqlen > 0 && this.queue.size() >= this.maxqlen)) {
      ro.msg = -1;
      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);
      return;
    }

    ro.duration = duration;
    const now = ro.entity.time();

    this.stats.enter(now);
    this.queue.push(ro, now);
    this.useFCFSSchedule(now);
  }

  useFCFSSchedule(timestamp) {
    argCheck(arguments, 1, 1);

    while (this.free > 0 && !this.queue.empty()) {
      const ro = this.queue.shift(timestamp);

      if (ro.cancelled) {
        continue;
      }
      for (let i = 0; i < this.freeServers.length; i++) {

        if (this.freeServers[i]) {
          this.freeServers[i] = false;
          ro.msg = i;
          break;
        }
      }

      this.free --;
      this.busyDuration += ro.duration;

            // cancel all other reneging requests
      ro.cancelRenegeClauses();

      const newro = new Request(this, timestamp, timestamp + ro.duration);

      newro.done(this.useFCFSCallback, this, ro);

      ro.entity.sim.queue.insert(newro);
    }
  }

  useFCFSCallback(ro) {
        // We have one more free server
    this.free ++;
    this.freeServers[ro.msg] = true;

    this.stats.leave(ro.scheduledAt, ro.entity.time());

        // if there is someone waiting, schedule it now
    this.useFCFSSchedule(ro.entity.time());

        // restore the deliver function, and deliver
    ro.deliver();

  }

  useLCFS(duration, ro) {
    argCheck(arguments, 2, 2);

        // if there was a running request..
    if (this.currentRO) {
      this.busyDuration += (this.currentRO.entity.time() - this.currentRO.lastIssued);
            // calcuate the remaining time
      this.currentRO.remaining = (
          this.currentRO.deliverAt - this.currentRO.entity.time());
            // preempt it..
      this.queue.push(this.currentRO, ro.entity.time());
    }

    this.currentRO = ro;
        // If this is the first time..
    if (!ro.saved_deliver) {
      ro.cancelRenegeClauses();
      ro.remaining = duration;
      ro.saved_deliver = ro.deliver;
      ro.deliver = this.useLCFSCallback;

      this.stats.enter(ro.entity.time());
    }

    ro.lastIssued = ro.entity.time();

        // schedule this new event
    ro.deliverAt = ro.entity.time() + duration;
    ro.entity.sim.queue.insert(ro);
  }

  useLCFSCallback() {
    const facility = this.source;

    if (this !== facility.currentRO) return;
    facility.currentRO = null;

        // stats
    facility.busyDuration += (this.entity.time() - this.lastIssued);
    facility.stats.leave(this.scheduledAt, this.entity.time());

        // deliver this request
    this.deliver = this.saved_deliver;
    delete this.saved_deliver;
    this.deliver();

        // see if there are pending requests
    if (!facility.queue.empty()) {
      const obj = facility.queue.pop(this.entity.time());

      facility.useLCFS(obj.remaining, obj);
    }
  }

  useProcessorSharing(duration, ro) {
    argCheck(arguments, 2, 2, null, Request);
    ro.duration = duration;
    ro.cancelRenegeClauses();
    this.stats.enter(ro.entity.time());
    this.useProcessorSharingSchedule(ro, true);
  }

  useProcessorSharingSchedule(ro, isAdded) {
    const current = ro.entity.time();

    const size = this.queue.length;

    const multiplier = isAdded ? ((size + 1.0) / size) : ((size - 1.0) / size);

    const newQueue = [];

    if (this.queue.length === 0) {
      this.lastIssued = current;
    }

    for (let i = 0; i < size; i++) {

      const ev = this.queue[i];

      if (ev.ro === ro) {
        continue;
      }
      const newev = new Request(
          this, current, current + (ev.deliverAt - current) * multiplier);

      newev.ro = ev.ro;
      newev.source = this;
      newev.deliver = this.useProcessorSharingCallback;
      newQueue.push(newev);

      ev.cancel();
      ro.entity.sim.queue.insert(newev);
    }

        // add this new request
    if (isAdded) {
      const newev = new Request(
          this, current, current + ro.duration * (size + 1));

      newev.ro = ro;
      newev.source = this;
      newev.deliver = this.useProcessorSharingCallback;
      newQueue.push(newev);

      ro.entity.sim.queue.insert(newev);
    }

    this.queue = newQueue;

        // usage statistics
    if (this.queue.length === 0) {
      this.busyDuration += (current - this.lastIssued);
    }
  }

  useProcessorSharingCallback() {
    const fac = this.source;

    if (this.cancelled) return;
    fac.stats.leave(this.ro.scheduledAt, this.ro.entity.time());

    fac.useProcessorSharingSchedule(this.ro, false);
    this.ro.deliver();
  }
}


Facility.FCFS = 1;
Facility.LCFS = 2;
Facility.PS = 3;
Facility.NumDisciplines = 4;


module.exports.Facility = Facility;