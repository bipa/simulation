
import {Queue} from '../queues/queue';
import {Entity} from './entity';
import {Distribution} from '../stats/distributions';

export class Resource extends Entity{


    processTime : Distribution;
    state : ResourceStates;
    seizedBy:Entity;

    constructor(model:any) {
            super(model);
            this.processTime= model.processTime;
            this.state = ResourceStates.idle;
    }



    seize(entity : Entity){
        this.state = ResourceStates.busy;
        this.seizedBy = entity;
        this.emitter.emit("busy", entity);
    }


    release(enitity:Entity){
        this.state = ResourceStates.idle;
        this.seizedBy = null;
        this.emitter.emit("idle", this);
    }


}


export enum ResourceStates{

        idle =0,
        busy,
        broken,
        notInService
    

}

export enum BusyStates{

        processing  = 0,
        walking,
        resting
}