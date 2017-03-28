

import {IBase} from './ibase';
import {Station} from './station';
let EventEmitter = require('events');


export class Base implements IBase{
    name;
    type:string;
    emitter:any;
    speed:number;
    currentStation:Station;

    constructor(entityModel:any)
    {
            this.type = entityModel.type;
            this.speed =entityModel.speed || 0;
            this.emitter = new EventEmitter();
    }
}