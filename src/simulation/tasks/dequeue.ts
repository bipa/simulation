

import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Entity } from '../model/entity';
import { IEntity } from '../model/ientity';


export class Dequeue{
        
        
       
       


       static dequeue(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity> ) 
       : Promise<DequeueResult>{

            let simEvent  =Dequeue.dequeueEvent(simulation,entity,queue);

            return simEvent.promise;
       }


       static dequeueEvent(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity>) : SimEvent<DequeueResult>{
           
            let simEvent = simulation.setTimer<DequeueResult>(0);
            simEvent.type="dequeue";
            simEvent.result = new DequeueResult(entity);
            simulation.scheduleEvent(simEvent, 0, `${entity.name} has dequeued ${queue.name}`);      
            queue.dequeue();
            simulation.eventEmitter.once(simEvent.name,sEvent=>{
            });


            return simEvent;



       }


}

export class DequeueResult implements ISimEventResult{

        entity:Entity

        constructor(entity : Entity){
            this.entity = entity;
        }
}