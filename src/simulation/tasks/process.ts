import { Queue, QueueTypes } from '../queues/queue';
import { FifoQueue } from '../queues/fifoQueue';
import { AbstractQueue } from '../queues/abstractQueue';
import { Entity,Allocations } from '../model/entity';
import { Resource, ResourceStates } from '../model/resource';
import { Simulation } from '../simulation';
import { Distribution } from '../stats/distributions';
import { SimEvent } from '../simEvent';
import { SeizeResult } from './seize';


let EventEmitter = require('events');


export class Process { 


    queue: AbstractQueue<Entity>;
    eventEmitter: any;
    simulation: Simulation;
    name: string;
    constructor(simulation: Simulation,name:string,  queueType: QueueTypes = QueueTypes.fifo) {
        switch (queueType) {
            case QueueTypes.fifo:
                this.queue = new FifoQueue<Entity>(simulation);
                break;
            default:
                this.queue = new FifoQueue<Entity>(simulation);
                break;
        }
        this.name = name;
        this.eventEmitter = new EventEmitter();
        this.simulation = simulation;
    }


    //Should listen to events to gather statistics

    

    //entering the process, used for stats collection
    enter(entity : Entity){

    }


    //leaving the process, used for stats collection
    leave(){

    }



    finalize(){
        this.queue.finalize();
    }

  

}

