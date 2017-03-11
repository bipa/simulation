

import { SimEvent } from '../simEvent';
import { Simulation } from '../simulation';
import { Station } from '../model/station';
import { Entity, Allocations } from '../model/entity';
import { Resource, ResourceStates } from '../model/resource';



export class Walk{
        
        
       
       


       static walk(simulation:Simulation,entity:Entity,from:Station,to : Station,speed=0.7) 
       : Promise<SimEvent>{

            let simEvent  =Walk.walkEvent(simulation,entity,from,to,speed)

            return simEvent.promise;
       }


       static walkEvent(simulation:Simulation,entity:Entity,from:Station,to : Station,speed=1) : SimEvent{
              speed = entity.speed  || speed;
            let route = simulation.route(from,to);
            let time  = speed*route.distance;
            let timeStampBefore = simulation.simTime;
            if(entity instanceof Resource)
            {
                   let resource =  entity as Resource;
                   resource.transfer();
            }
            let simEvent = simulation.setTimer(time,"Walk", `${entity.name} is walking from ${from.name} to ${to.name}`);
            simulation.eventEmitter.once(simEvent.name,sEvent=>{
                if(entity instanceof Resource)
                {
                       let resource =  entity as Resource;
                       resource.activateNextState();
                }
                else
                {
                        simulation.recorder.recordEntityStat(entity,timeStampBefore,Allocations.transfer);
                 }
           });

            return simEvent;
       }


}