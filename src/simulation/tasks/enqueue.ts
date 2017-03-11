

import { Queue, QueueTypes } from '../queues/queue';
import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Station } from '../model/station';
import { Entity, Allocations } from '../model/entity';
import { IEntity } from '../model/ientity';
import { Resource, ResourceStates } from '../model/resource';
import { FifoQueue } from '../queues/fifoQueue';


export class Enqueue{
        
        
       
       


       static enqueue(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity> ) 
       : Promise<SimEvent<EnqueueResult>>{

            let simEvent  =Enqueue.enqueueEvent(simulation,entity,queue);

            return simEvent.promise;
       }


       static enqueueEvent(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity>) : SimEvent<EnqueueResult>{
           
            let simEvent = simulation.setTimer();
            simEvent.type="enqueue";
           simEvent.result = entity;
           
            return simEvent;



       }


}

export class EnqueueResult implements ISimEventResult{

}