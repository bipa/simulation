

import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Entity ,EntityStates} from '../model/entity';
import { IEntity } from '../model/ientity';
import { Resource } from '../model/resource';
import { ISimulation } from '../model/iSimulation';


export class Dequeue{
        
        
       


        static dequeue(simulation:ISimulation,entity: Entity,  queue: AbstractQueue<IEntity> ) 
       : Promise<DequeueResult>{

            let simEvent  =Dequeue.dequeueEvent(simulation,entity,queue);
            simulation.scheduleEvent2(simEvent);
            return simEvent.promise;
       }


       static dequeueEvent(simulation:ISimulation,entity: Entity,  queue: AbstractQueue<IEntity>) : SimEvent<DequeueResult>{
           
            let simEvent = new SimEvent<DequeueResult>(simulation.simTime,simulation.simTime,"dequeue",`${entity.name} has dequeued ${queue.name}`);
           simEvent.result = new DequeueResult(entity);   
           simulation.eventEmitter.once(simEvent.name, simEvent=>{
                queue.dequeue();
                simulation.recorder.recordEntityStat(entity,entity.lastEnqueuedAt,EntityStates.wait);

           })
          
           
           

            return simEvent;



       }
       

/*
       static dequeue(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity> ) 
       : Promise<DequeueResult>{

            let simEvent  =Dequeue.dequeueEvent(simulation,entity,queue);

            return simEvent.promise;
       }


       static dequeueEvent(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity>) : SimEvent<DequeueResult>{
           
            let simEvent = simulation.setTimer<DequeueResult>(0,"dequeue",`${entity.name} has dequeued ${queue.name}`);
           simEvent.result = new DequeueResult(entity);   
           queue.dequeue();
           simulation.recorder.recordEntityStat(entity,entity.lastEnqueuedAt,Allocations.wait);

           
           

            return simEvent;



       }*/


}

export class DequeueResult implements ISimEventResult{

        entity:Entity

        constructor(entity : Entity){
            this.entity = entity;
        }
}