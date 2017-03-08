
import {Resource,ResourceStates} from './resource'

let EventEmitter = require('events');

export class Entity{

    static count:number=0;

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

    name:string;
    emitter:any;
    speed:number;



    constructor(entityModel:any){
        this.type = entityModel.type;
        this.speed = entityModel.speed;
        this.name = entityModel.name || entityModel.type+Entity.count;
        
            Entity.count++;
            this.emitter = new EventEmitter();
    }


    dispose(time:number){
        this.timeLeft= time;
        this.duration = this.timeLeft-this.timeEntered;
    }
    
}



export enum Allocations{

        valueAdded =0,
        nonValueAdded,
        transfer,
        other,
        wait
}