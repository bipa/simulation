
import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Entity } from '../model/entity';
import { IEntity } from '../model/ientity';
import { Resource ,ResourceStates} from '../model/resource';
import { ISimulation } from '../model/iSimulation';


export class Release{
        
        
       
       


       static release(simulation:ISimulation,entity: Entity,  resource:Resource ) 
       : Promise<ReleaseResult>{

            let simEvent  =Release.releaseEvent(simulation,entity,resource);
           
            return simEvent.promise;
       }


       static releaseEvent(simulation:ISimulation,entity: Entity,  resource:Resource) : SimEvent<ReleaseResult>{
           
            let simEvent = new SimEvent<ReleaseResult>(simulation.simTime,simulation.simTime,"release",`${entity.name} released ${resource.name}`);
            simEvent.type = "release";
            simEvent.result = new ReleaseResult(entity,resource);
            //simulation.scheduleEvent(simEvent, 0,`${entity.name} released ${resource.name}`);  
            simulation.eventEmitter.once(simEvent.name,simE=>{
                 
                
                resource.activateNextState();
                if(resource.emitter.listenerCount("idle")===0)
                {
                    simulation.nextStep2();
                }
                else{
                    //Changes the resource to "idle", and thereby moves the simulation forward
                
                    //This is wrong since the state wasa never changed
                }

            })

            simulation.scheduleEvent2(simEvent);

            return simEvent;



       }


}

export class ReleaseResult implements ISimEventResult{

        entity:Entity;
        resource:Resource;

        constructor(entity : Entity,resource:  Resource){
            this.entity = entity;
            this.resource = resource;
                }
}