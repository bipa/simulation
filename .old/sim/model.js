"use strict";

class Model {
  constructor(name) {
    this.id = this.constructor._nextId();
    this.name = name || `${this.constructor.name} ${this.id}`;
  }

  static get totalInstances() {
    return !this._totalInstances ? 0 : this._totalInstances;
  }

  static _nextId() {
    this._totalInstances = this.totalInstances + 1;
    return this._totalInstances;
  }
}

module.exports.Model = Model;

//export { Model };
//export default Model;