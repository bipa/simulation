
import {Resource,ResourceStates} from './resource'
import {Station} from './station'
import {IEntity} from './iEntity'

let EventEmitter = require('events');

export class Entity implements IEntity{

    static counter:Map<string,any>=new Map<string,any>();

    finalize:Function;
    type:string;
    timeEntered:number =0;
    timeLeft:number =0;
    duration:number =0;
    transferTime:number=0;
    valueAddedTime:number =0;
    nonValueAddedTime:number =0;
    waitTime:number = 0;
    otherTime:number = 0;
    runtime :any = {};

    currentStation:Station;

    name:string;
    emitter:any;
    speed:number;

    lastEnqueuedAt:number =0;

    constructor(entityModel:any){
        this.type = entityModel.type;
        this.speed = entityModel.speed;
        if(!Entity.counter.has(this.type)) Entity.counter.set(this.type,{value:1});
        this.name = entityModel.name || entityModel.type+Entity.counter.get(this.type).value;
        
            Entity.counter.get(this.type).value++;
            this.emitter = new EventEmitter();
    }


    dispose(time:number){
        this.timeLeft= time;
        this.duration = this.timeLeft-this.timeEntered;
    }


    enqueue(timestamp:number){
        this.lastEnqueuedAt = timestamp;
    }


    dequeue(timestamp:number){
        //this.waitTime+=timestamp-this.lastEnqueuedAt;
        
    }
    
}



export enum Allocations{

        valueAdded =0,
        nonValueAdded,
        transfer,
        other,
        wait
}