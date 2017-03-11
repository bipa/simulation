
import { Queue, QueueTypes } from '../queues/queue';
import { AbstractQueue } from '../queues/abstractQueue';
import { SimEvent } from '../simEvent';
import { Simulation } from '../simulation';
import { Station } from '../model/station';
import { Entity, Allocations } from '../model/entity';
import { Resource, ResourceStates } from '../model/resource';
import { FifoQueue } from '../queues/fifoQueue';

let EventEmitter = require('events');


export class Seize{
        

        queue: AbstractQueue<Entity>;
        simulation: Simulation;
        numberOfResourcesToSeize:number;
        eventEmitter : any;
        resources
        
       constructor(simulation: Simulation, resources: Resource[], numberOfResourcesToSeize : number = 1, queueType: QueueTypes = QueueTypes.fifo){
            
           this.simulation = simulation; 
           switch (queueType) {
                case QueueTypes.fifo:
                    this.queue = new FifoQueue<Entity>(simulation);
                    break;
                default:
                    this.queue = new FifoQueue<Entity>(simulation);
                    break;
            }
            
            this.numberOfResourcesToSeize = numberOfResourcesToSeize;
            this.eventEmitter = new EventEmitter();
            this.eventEmitter.setMaxListeners(100);
            this.resources = resources || new Array<Resource>();
       }
       


       seize(entity: Entity) : Promise<SimEvent>{

            let simEvent  =this.seizeEvent(entity)

            return simEvent.promise;
       }


       seizeEvent(entity: Entity) : SimEvent{
             

            //resources cannot be null or empty

            
            
            let message = "";
            this.enqueue(entity);
            let seizeResult: SeizeResult;
            //seize directly
            
            let simEvent = this.simulation.setTimer();
            simEvent.type="seize";
            simEvent.result = seizeResult;
            if (this.queue.length == 1) {    
                let idleResources = this.resources.filter(r => { return r.state === ResourceStates.idle });
                if (idleResources && idleResources.length > 0) {
                    let resource = this.resources[0];
                    let sResult =   this.inner_seize(entity,resource,simEvent);
                    simEvent.result  = sResult;
                }
                else {
                    this.resources.forEach(r => {
                    r.emitter.once("idle", resource => {
                        if (!simEvent.isScheduled) {
                            let sResult =   this.inner_seize(entity,resource,simEvent);
                            simEvent.result  = sResult;
                        }
                        });
                    });
                }
            }
            else {
                //Listen for the one time the entity is in front....then seize
                this.eventEmitter.once(entity.name, async () => {
                    
                    let sResult = await this.seizeFromResources(entity, simEvent);
                    simEvent.result  = sResult;

                })
            }
            return simEvent;
       }
 

    seizeFromResources(entity: Entity, simEvent: SimEvent) : Promise<SeizeResult>{

        let promise = new Promise<SeizeResult>((resolve,reject)=>{




            let idleResources = this.resources.filter(r => { return r.state === ResourceStates.idle });
            if (idleResources && idleResources.length > 0) {
                    let resource = this.resources[0];
                    let sResult =   this.inner_seize(entity,resource,simEvent);
                    resolve(sResult);
            }
            else {
                this.resources.forEach(r => {
                r.emitter.once("idle", resource => {
                    if (!simEvent.isScheduled) {
                          let sResult =   this.inner_seize(entity,resource,simEvent);
                          resolve(sResult);
                    }
            });
                });
            }


        })

        return promise;


    }

    inner_seize(entity: Entity, resource: Resource, simEvent: SimEvent) :SeizeResult {
                resource.seize(entity);
                simEvent.result = new SeizeResult(entity, resource);
                this.simulation.scheduleEvent(simEvent, 0, `${this.resources[0].name} seized by ${entity.name}, now start processing`);
                this.dequeue();
                return simEvent.result;
    }


    enqueue(entity: Entity) {
        this.queue.enqueue(entity);
        entity.runtime.enqueueTime = this.simulation.simTime;
        this.simulation.log(`${entity.name} enqueued`, "enqueue")

        this.eventEmitter.emit("enqueued")
    }


    dequeue() {
        let entity = this.queue.dequeue();
        this.simulation.recorder.recordEntityStat(entity,entity.runtime.enqueueTime,Allocations.wait);
        this.simulation.log(`${entity.name} dequeued`, "dequeue")
        if (this.queue.length > 0) {
            let nextEntity = this.queue.peek();
            this.eventEmitter.emit(nextEntity.name);
        }
    }

}


export class SeizeResult {

    entity: Entity;
    resources: Resource[];
    resource:Resource;


    constructor(entity: Entity,resource:Resource = null, resources: Resource[] = null) {
        this.entity = entity;
        this.resources = resources;
        this.resource = resource;
    }
}