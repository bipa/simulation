
import { Queue, QueueTypes } from '../queues/queue';
import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent,ISimEventResult } from '../simEvent';
import { Simulation } from '../simulation';
import { Station } from '../model/station';
import { Entity, Allocations } from '../model/entity';
import { IEntity } from '../model/ientity';
import { Resource, ResourceStates } from '../model/resource';
import { FifoQueue } from '../queues/fifoQueue';



export class Seize{
        

       


       static seize(simulation: Simulation,entity: Entity, resources: Resource[], numberOfResourcesToSeize : number = 1, queue: AbstractQueue<IEntity> ) : Promise<SimEvent<SeizeResult>>{

            let simEvent  =Seize.seizeEvent(simulation,entity,resources,numberOfResourcesToSeize,queue);

            return simEvent.promise;
       }


       static seizeEvent(simulation: Simulation,entity: Entity, resources: Resource[], numberOfResourcesToSeize : number = 1, queue: AbstractQueue<IEntity> ) : SimEvent<SeizeResult>{
             

            //resources cannot be null or empty

            
            
            let message = "";
            queue.enqueue(entity);
            let seizeResult: SeizeResult;
            //seize directly
            
            let simEvent = simulation.setTimer<SeizeResult>();
            simEvent.type="seize";
            simEvent.result = seizeResult;
            if (queue.length == 1) {    
                let idleResources = resources.filter(r => { return r.state === ResourceStates.idle });
                if (idleResources && idleResources.length > 0) {
                    let resource = resources[0];
                    let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent,queue);
                    simEvent.result  = sResult;
                }
                else {
                    resources.forEach(r => {
                    r.emitter.once("idle", resource => {
                        if (!simEvent.isScheduled) {
                            let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent,queue);
                            simEvent.result  = sResult;
                        }
                        });
                    });
                }
            }
            else {
                //Listen for the one time the entity is in front....then seize
                queue.eventEmitter.once(entity.name, async () => {
                    
                    let sResult = await Seize.seizeFromResources(simulation,entity, simEvent,resources,queue);
                    simEvent.result  = sResult;

                })
            }
            return simEvent;
       }
 

    static seizeFromResources(simulation: Simulation,entity: Entity, simEvent: SimEvent<SeizeResult>,resources: Resource[], queue: AbstractQueue<IEntity> ) : Promise<SeizeResult>{

        let promise = new Promise<SeizeResult>((resolve,reject)=>{




            let idleResources = resources.filter(r => { return r.state === ResourceStates.idle });
            if (idleResources && idleResources.length > 0) {
                    let resource = resources[0];
                    let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent,queue);
                    resolve(sResult);
            }
            else {
                resources.forEach(r => {
                r.emitter.once("idle", resource => {
                    if (!simEvent.isScheduled) {
                          let sResult =   Seize.inner_seize(simulation,entity,resource,simEvent,queue);
                          resolve(sResult);
                    }
            });
                });
            }


        })

        return promise;


    }

   static  inner_seize(simulation: Simulation,entity: Entity, resource: Resource, simEvent: SimEvent<SeizeResult>, queue: AbstractQueue<IEntity> ) :SeizeResult {
                resource.seize(entity);
                simEvent.result = new SeizeResult(entity, resource);
                simulation.scheduleEvent(simEvent, 0, `${resource.name} seized by ${entity.name}, now start processing`);
                queue.dequeue();
                return simEvent.result;
    }


  

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