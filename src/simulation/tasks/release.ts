
import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Entity } from '../model/entity';
import { IEntity } from '../model/ientity';
import { Resource } from '../model/resource';


export class Release{
        
        
       
       


       static release(simulation:Simulation,entity: Entity,  resource:Resource ) 
       : Promise<ReleaseResult>{

            let simEvent  =Release.releaseEvent(simulation,entity,resource);

            return simEvent.promise;
       }


       static releaseEvent(simulation:Simulation,entity: Entity,  resource:Resource) : SimEvent<ReleaseResult>{
           
            let simEvent = simulation.setTimer<ReleaseResult>(0,"release",`${entity.name} released ${resource.name}`);
            simEvent.type = "release";
            simEvent.result = new ReleaseResult(entity,resource);
            //simulation.scheduleEvent(simEvent, 0,`${entity.name} released ${resource.name}`);  
            resource.activateNextState();
            


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