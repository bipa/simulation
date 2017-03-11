

import { SimEvent , ISimEventResult} from '../simEvent';
import { Simulation } from '../simulation';
import { Entity, Allocations } from '../model/entity';
import { Resource, ResourceStates } from '../model/resource';
import { Distribution } from '../stats/distributions';


export class Delay{
        
        
       
       


       static delay(simulation:Simulation,entity: Entity, resource: Resource, processTimeDist: Distribution,allocation:Allocations = Allocations.valueAdded) 
       : Promise<SimEvent<DelayResult>>{

            let simEvent  =Delay.delayEvent(simulation,entity,resource,processTimeDist,allocation);

            return simEvent.promise;
       }


       static delayEvent(simulation:Simulation,entity: Entity, resource: Resource, 
                    processTimeDist,allocation:Allocations = Allocations.valueAdded) : SimEvent<DelayResult>{
           
           
            let processTime = simulation.addRandomValue(processTimeDist);
            let timeStampBefore = simulation.simTime;
            let simEvent =  simulation.setTimer<DelayResult>(processTime, "delay", `${entity.name} processed by ${resource.name}`);
            resource.process(entity);       
            simulation.eventEmitter.once(simEvent.name,sEvent=>{
                simulation.recorder.recordEntityStat(entity,timeStampBefore,allocation);
            });
            return simEvent;



       }


}

export  class DelayResult implements ISimEventResult{

}
