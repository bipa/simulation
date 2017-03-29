

import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Entity } from '../model/entity';
import { IEntity } from '../model/ientity';
import { ISimulation } from '../model/iSimulation';


export class Enqueue{
        
        
         static enqueue(simulation:ISimulation,entity: Entity,  queue: AbstractQueue<IEntity> ) 
       : Promise<EnqueueResult>{

            let simEvent  =Enqueue.enqueueEvent(simulation,entity,queue);
                
            return simEvent.promise;
       }


       static enqueueEvent(simulation:ISimulation,entity: Entity,  queue: AbstractQueue<IEntity>) : SimEvent<EnqueueResult>{
           
            let simEvent = new SimEvent<EnqueueResult>(simulation.simTime,simulation.simTime,"front",`  ${entity.name} is now in front of ${queue.name}`);
            
            simEvent.result = new EnqueueResult(entity);
           
           
            if (queue.length == 1) {  
                simulation.scheduleEvent2(simEvent);
            }
            else{
                 //Listen for the one time the entity is in front....then seize
                queue.eventEmitter.once(entity.name,  () => {        
                    simEvent.deliverAt = simulation.simTime;
                    simulation.scheduleEvent2(simEvent);
            
                });

                simulation.nextStep2();
            }

           
           
            return simEvent;

            

       }
        


      /* static enqueue(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity> ) 
       : Promise<EnqueueResult>{

            let simEvent  =Enqueue.enqueueEvent(simulation,entity,queue);

            return simEvent.promise;
       }


       static enqueueEvent(simulation:Simulation,entity: Entity,  queue: AbstractQueue<IEntity>) : SimEvent<EnqueueResult>{
           
            let simEvent = simulation.setTimer<EnqueueResult>();
            simEvent.type="front";
            simEvent.result = new EnqueueResult(entity);
            queue.enqueue(entity);
            if (queue.length == 1) {    
                simulation.scheduleEvent(simEvent, 0, `  ${entity.name} is now in front of ${queue.name}`);      
            }
            else{
                 //Listen for the one time the entity is in front....then seize
                queue.eventEmitter.once(entity.name, async () => {        
                        simulation.scheduleEvent(simEvent, 0, `  ${entity.name} is now in front of ${queue.name}`);      
                })
            }


           
           
            return simEvent;



       }*/


}

export class EnqueueResult implements ISimEventResult{

        entity:Entity

        constructor(entity : Entity){
            this.entity = entity;
        }
}