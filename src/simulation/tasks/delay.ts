

import { SimEvent , ISimEventResult} from '../simEvent';
import {ISimulation} from '../model/iSimulation';
import { Entity, EntityStates } from '../model/entity';
import { Resource, ResourceStates } from '../model/resource';
import { Distribution } from '../stats/distributions';


export class Delay{
        
        
       
       


       static delay(simulation:ISimulation,entity: Entity, resource: Resource, processTimeDist: Distribution,allocation:EntityStates = EntityStates.valueAdded) 
       : Promise<DelayResult>{

            let simEvent  =Delay.delayEvent(simulation,entity,resource,processTimeDist,allocation);
            simulation.scheduleEvent2(simEvent);
            return simEvent.promise;
       }


       static delayEvent(simulation:ISimulation,entity: Entity, resource: Resource, 
                    processTimeDist,allocation:EntityStates = EntityStates.valueAdded) : SimEvent<DelayResult>{
           
           
            let processTime = simulation.addRandomValue(processTimeDist);
            let timeStampBefore = simulation.simTime;
            let simEvent =  new SimEvent<DelayResult>(simulation.simTime,simulation.simTime+processTime, "delay", `  ${entity.name} processed by ${resource.name}`);
            
            resource.setState();       
            simulation.eventEmitter.once(simEvent.name,sEvent=>{
               // simulation.recorder.recordEntityStat(entity,timeStampBefore,allocation);
            });
            return simEvent;



       }


}

export  class DelayResult implements ISimEventResult{

}
