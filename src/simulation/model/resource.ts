
import {Queue} from '../queues/queue';
import {Entity} from './entity';
import {Distribution} from '../stats/distributions';

export class Resource extends Entity{


    processTime : Distribution;
    state : ResourceStates;
    scheduledState:ScheduledStates;
    seizedBy:Entity;
    idleTime:number=0;
    otherTime:number=0;
    busyTime:number=0;
    brokenTime:number=0;
    transferTime:number=0;
    lastStateChangedTime:number=0;
    lastScheduledStateChangedTime :  number  = 0;



    constructor(model:any) {
            super(model);
            this.processTime= model.processTime;
            this.state = ResourceStates.idle;
            this.scheduledState = ScheduledStates.scheduled;
    }

    unSchedule(){
        
        if(this.scheduledState === ScheduledStates.unScheduled) return;
        
        this.scheduledState = ScheduledStates.unScheduled;
        this.emitter.emit("unScheduled", this);
    } 
    
    schedule(){
        
        if(this.scheduledState === ScheduledStates.scheduled) return;

        this.scheduledState = ScheduledStates.scheduled;
        this.emitter.emit("scheduled", this);
    }


    transfer(){

        if(this.state === ResourceStates.transfer) return;

        this.emitter.emit("onBeforeResourceStateChanged", this);
        this.state = ResourceStates.transfer;

        this.emitter.emit("transfer", this);
    }

    process(entity:Entity){

        if(this.state === ResourceStates.busy) return;

        this.emitter.emit("onBeforeResourceStateChanged", this);
        this.state = ResourceStates.busy;

        this.emitter.emit("onResourceBusy", this);
        this.emitter.emit("busy", entity);
    }


    seize(entity : Entity){
 
        
        if(this.state === ResourceStates.seized) return;

        this.emitter.emit("onBeforeResourceStateChanged", this);
        this.state = ResourceStates.seized;
        this.seizedBy = entity;
       this.emitter.emit("seized", entity);
    }


    release(enitity:Entity){

        if(this.state === ResourceStates.idle) return;

        this.emitter.emit("onBeforeResourceStateChanged", this);
        this.state = ResourceStates.idle;
        this.seizedBy = null;
        this.emitter.emit("idle", this);
    }

    broken(){
        
        
        if(this.state === ResourceStates.broken ) return;

        this.emitter.emit("onBeforeResourceStateChanged", this);
        this.state = ResourceStates.broken;
        this.seizedBy = null;
        this.emitter.emit("broken", this);
    }

    other(){
        
        
        if(this.state === ResourceStates.broken ) return;

        this.emitter.emit("onBeforeResourceStateChanged", this);
        this.state = ResourceStates.other;
        this.seizedBy = null;
        this.emitter.emit("other", this);
    }



}


export enum ResourceStates{

        idle =0,
        transfer,
        seized,
        busy,
        broken,
        other,
    

}

export enum ScheduledStates{

        scheduled =0,
        unScheduled
    

}
