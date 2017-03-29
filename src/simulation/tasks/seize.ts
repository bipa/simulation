
import { Queue, QueueTypes } from '../queues/queue';
import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Station } from '../model/station';
import { Entity, EntityStates } from '../model/entity';
import { IEntity } from '../model/ientity';
import { Resource, ResourceStates } from '../model/resource';
import { FifoQueue } from '../queues/fifoQueue';
import { ISimulation } from '../model/iSimulation';



export class Seize{
        

       static seize(simulation: ISimulation,entity: Entity, resources: Resource[], numberOfResourcesToSeize : number = 1) : Promise<SeizeResult>{

            let simEvent  =Seize.seizeEvent(simulation,entity,resources,numberOfResourcesToSeize);

            return simEvent.promise;
       }


       static seizeEvent(simulation: ISimulation,entity: Entity, resources: Resource[], numberOfResourcesToSeize : number = 1) : SimEvent<SeizeResult>{
             

            //resources cannot be null or empty

            
            
            let message = "";
            let seizeResult: SeizeResult;
            //seize directly
            
            let simEvent = new SimEvent<SeizeResult>(simulation.simTime,simulation.simTime,"seize","");
            simEvent.result = seizeResult;
           
            let idleResources = resources.filter(r => { return r.state === ResourceStates.idle });
            if (idleResources && idleResources.length > 0) {
                let resource = resources[0];
                let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent);
                simEvent.result  = sResult;
            }
            else {
                 resources.forEach(r => {
                    Seize.seizeOnIdle(simulation,entity,r,simEvent);
                 });
                 simulation.nextStep2();
            }


            return simEvent;
       }
 
       static seizeOnIdle(simulation: ISimulation,entity: Entity, resource: Resource, 
                            simEvent: SimEvent<SeizeResult> ){  
                   
            resource.emitter.once("idle", (resource : Resource) => {
               if (!simEvent.isScheduled && resource.state !== ResourceStates.idle) {
                    Seize.seizeOnIdle(simulation,entity,resource,simEvent);
                   
               }else{
                   simEvent.deliverAt = simulation.simTime;
                   let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent);
                   simEvent.result  = sResult;
                    simulation.eventEmitter.once(simEvent.name,(simE)=>{
                        if(resource.emitter.listenerCount("idle")===0)
                        {
                            simulation.nextStep2();
                        }
                    })
               }
            });
            
        }
   static  inner_seize(simulation: ISimulation,entity: Entity, resource: Resource, 
                            simEvent: SimEvent<SeizeResult> ) :SeizeResult {
                entity.seizeResource(resource);
                simEvent.result = new SeizeResult(entity, resource);
                simEvent.message = `  ${entity.name} seized ${resource.name}`;
                simulation.scheduleEvent2(simEvent);
                 return simEvent.result;
    }


  
       

/*
       static seize(simulation: Simulation,entity: Entity, resources: Resource[], numberOfResourcesToSeize : number = 1) : Promise<SeizeResult>{

            let simEvent  =Seize.seizeEvent(simulation,entity,resources,numberOfResourcesToSeize);

            return simEvent.promise;
       }


       static seizeEvent(simulation: Simulation,entity: Entity, resources: Resource[], numberOfResourcesToSeize : number = 1) : SimEvent<SeizeResult>{
             

            //resources cannot be null or empty

            
            
            let message = "";
            let seizeResult: SeizeResult;
            //seize directly
            
            let simEvent = simulation.setTimer<SeizeResult>();
            simEvent.type="seize";
            simEvent.result = seizeResult;
           
            let idleResources = resources.filter(r => { return r.state === ResourceStates.idle });
            if (idleResources && idleResources.length > 0) {
                let resource = resources[0];
                let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent);
                simEvent.result  = sResult;
            }
            else {
                 resources.forEach(r => {
                    Seize.seizeOnIdle(simulation,entity,r,simEvent);
                 });
            }


            return simEvent;
       }
 
       static seizeOnIdle(simulation: Simulation,entity: Entity, resource: Resource, 
                            simEvent: SimEvent<SeizeResult> ){  
                   
            resource.emitter.once("idle", (resource : Resource) => {
               if (!simEvent.isScheduled && resource.state !== ResourceStates.idle) {
                    Seize.seizeOnIdle(simulation,entity,resource,simEvent);
                   
               }else{
                   let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent);
                   simEvent.result  = sResult;
               }
            });
            
        }
   static  inner_seize(simulation: Simulation,entity: Entity, resource: Resource, 
                            simEvent: SimEvent<SeizeResult> ) :SeizeResult {
                resource.seize(entity);
                simEvent.result = new SeizeResult(entity, resource);
                simulation.scheduleEvent(simEvent, 0, `  ${entity.name} seized ${resource.name}`);
                 return simEvent.result;
    }


  */

}


export class SeizeResult implements ISimEventResult {

    entity: Entity;
    resources: Resource[];
    resource:Resource;


    constructor(entity: Entity,resource:Resource = null, resources: Resource[] = null) {
        this.entity = entity;
        this.resources = resources;
        this.resource = resource;
    }
}