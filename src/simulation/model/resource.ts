
import {Queue} from '../queues/queue';
import {Distribution} from '../stats/distributions';
import {Entity} from './entity';
import {Base} from './base'

export class Resource extends Base{


    processTime : Distribution;    
    state : ResourceStates;   
    scheduledState:ScheduledStates;

    isSeized :boolean = false;
    seizedBy:Entity[];
    
    idleTime:number=0;
    otherTime:number=0;
    busyTime:number=0;
    brokenTime:number=0;
    transferTime:number=0;
    waitTime:number=0;
    inActiveTime:number=0;



    constructor(model:any) {
            super(model);
            this.processTime= model.processTime;
            this.state = ResourceStates.idle;
            this.scheduledState = ScheduledStates.scheduled;
            this.seizedBy = [];
    }

    seize(entity : Entity){
        this.isSeized = true;
        this.seizedBy.push(entity);
        this.emitter.emit("seized", this);
        this.setState(ResourceStates.busy);
    }

    unSeize(entity : Entity){
        let index = this.seizedBy.indexOf(entity);
        this.seizedBy.splice(index,1);
        if(this.seizedBy.length===0){
            
            this.isSeized = true;
            this.setState();
        }
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



    private changeState(newState : ResourceStates){
        
        if(this.state === newState ) return;
        this.emitter.emit("onBeforeResourceStateChanged", this);
        this.state = newState;
        this.emitter.emit("onAfterResourceStateChanged", this);
    }


    setState(newState : ResourceStates = ResourceStates.idle){
        
        
        this.changeState(newState);

        switch (newState) {
            case ResourceStates.idle:
                this.emitter.emit("idle", this);
                break;
            case ResourceStates.busy:
                this.emitter.emit("busy", this);
                break;
            case ResourceStates.broken:
                this.emitter.emit("broken", this);
                break;
            case ResourceStates.other:
                this.emitter.emit("other", this);
                break;
            case ResourceStates.wait:
                this.emitter.emit("wait", this);
                break;
            case ResourceStates.transfer:
                this.emitter.emit("transfer", this);
                break;
            case ResourceStates.released:
                this.emitter.emit("other", this);
                break;
            case ResourceStates.inActive:
                this.emitter.emit("inActive", this);
                break;
        
            default:
                break;
        }





        
    }



}


export enum ResourceStates{

        idle =0,
        transfer,
        wait,
        released,
        busy,
        broken,
        other,
        inActive,
    

}

export enum ScheduledStates{

        scheduled =0,
        unScheduled
    

}
export enum InterruptRules{

        finish =0,
        preempt,
        cancel,
    

}
