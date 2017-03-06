
var Model = require("./model.js").Model;
var argCheck = require("./argcheck.js");
var Queue = require("./queues.js").Queue;



class Store extends Model {
  constructor(capacity, name = null) {
    argCheck(arguments, 1, 2);
    super(name);

    this.capacity = capacity;
    this.objects = [];
    this.putQueue = new Queue();
    this.getQueue = new Queue();
  }

  current() {
    return this.objects.length;
  }

  size() {
    return this.capacity;
  }

  get(filter, ro) {
    argCheck(arguments, 2, 2);

    if (this.getQueue.empty() && this.current() > 0) {
      let found = false;

      let obj;

            // TODO: refactor this code out
            // it is repeated in progressGetQueue
      if (filter) {
        for (let i = 0; i < this.objects.length; i++) {

          obj = this.objects[i];
          if (filter(obj)) {
            found = true;
            this.objects.splice(i, 1);
            break;
          }
        }
      } else {
        obj = this.objects.shift();
        found = true;
      }

      if (found) {
        this.available --;

        ro.msg = obj;
        ro.deliverAt = ro.entity.time();
        ro.entity.sim.queue.insert(ro);

        this.getQueue.passby(ro.deliverAt);

        this.progressPutQueue();

        return;
      }
    }

    ro.filter = filter;
    this.getQueue.push(ro, ro.entity.time());
  }

  put(obj, ro) {
    argCheck(arguments, 2, 2);

    if (this.putQueue.empty() && this.current() < this.capacity) {
      this.available ++;

      ro.deliverAt = ro.entity.time();
      ro.entity.sim.queue.insert(ro);

      this.putQueue.passby(ro.deliverAt);
      this.objects.push(obj);

      this.progressGetQueue();

      return;
    }

    ro.obj = obj;
    this.putQueue.push(ro, ro.entity.time());
  }

  progressGetQueue() {
    let ro;

    while (ro = this.getQueue.top()) {  // eslint-disable-line no-cond-assign
      // if obj is cancelled.. remove it.
      if (ro.cancelled) {
        this.getQueue.shift(ro.entity.time());
        continue;
      }

      // see if this request can be satisfied
      if (this.current() > 0) {
        const filter = ro.filter;

        let found = false;

        let obj;

        if (filter) {
          for (let i = 0; i < this.objects.length; i++) {

            obj = this.objects[i];
            if (filter(obj)) {  // eslint-disable-line max-depth
              found = true;
              this.objects.splice(i, 1);
              break;
            }
          }
        } else {
          obj = this.objects.shift();
          found = true;
        }

        if (found) {
                    // remove it..
          this.getQueue.shift(ro.entity.time());
          this.available --;

          ro.msg = obj;
          ro.deliverAt = ro.entity.time();
          ro.entity.sim.queue.insert(ro);
        } else {
          break;
        }

      } else {
                // this request cannot be satisfied
        break;
      }
    }
  }

  progressPutQueue() {
    let ro;

    while (ro = this.putQueue.top()) {  // eslint-disable-line no-cond-assign
            // if obj is cancelled.. remove it.
      if (ro.cancelled) {
        this.putQueue.shift(ro.entity.time());
        continue;
      }

            // see if this request can be satisfied
      if (this.current() < this.capacity) {
                // remove it..
        this.putQueue.shift(ro.entity.time());
        this.available ++;
        this.objects.push(ro.obj);
        ro.deliverAt = ro.entity.time();
        ro.entity.sim.queue.insert(ro);
      } else {
        // this request cannot be satisfied
        break;
      }
    }
  }

  putStats() {
    return this.putQueue.stats;
  }

  getStats() {
    return this.getQueue.stats;
  }
}

module.exports.Store = Store;