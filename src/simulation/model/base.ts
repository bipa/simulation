

import {IBase} from './ibase';
import {Station} from './station';
let EventEmitter = require('events');


export class Base implements IBase{


    static counter:Map<string,any>=new Map<string,any>();

    name;
    type:string;
    emitter:any;
    speed:number;
    currentStation:Station;
    timeCreated:number =0;
    timeDisposed:number =0;

    
    lastStateChangedTime:number=0;
    lastScheduledStateChangedTime :  number  = 0;

    constructor(entityModel:any)
    {
            this.type = entityModel.type;
            this.speed =entityModel.speed || 0;
            this.emitter = new EventEmitter();

            
        if(!Base.counter.has(this.type)) Base.counter.set(this.type,{value:1});
        this.name = entityModel.name || entityModel.type+Base.counter.get(this.type).value;
        Base.counter.get(this.type).value++;
    }


    

    dispose(time:number){
        this.timeDisposed= time;
    }


}