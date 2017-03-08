import { Queue, QueueTypes } from '../queues/queue';
import { FifoQueue } from '../queues/fifoQueue';
import { AbstractQueue } from '../queues/abstractQueue';
import { Entity } from '../model/entity';
import { Allocations } from '../model/allocations';
import { Resource, ResourceStates } from '../model/resource';
import { Simulation } from '../simulation';
import { Distribution } from '../stats/distributions';
import { SimEvent } from '../simEvent';


let EventEmitter = require('events');


export class Process { 


    queue: AbstractQueue<Entity>;
    resources: Array<Resource>;
    eventEmitter: any;
    numberOfResourcesToSeize: number;
    simulation: Simulation;
    name: string;
    allocation : Allocations;
    constructor(simulation: Simulation, processModel: any, 
        resources: Array<Resource> = null, numberOfResourcesToSeize = 1, queueType: QueueTypes = QueueTypes.fifo) {
        switch (queueType) {
            case QueueTypes.fifo:
                this.queue = new FifoQueue<Entity>(simulation);
                break;
            default:
                this.queue = new FifoQueue<Entity>(simulation);
                break;
        }
        this.allocation = processModel.allocation || Allocations.valueAdded;
        this.name = processModel.name;
        this.numberOfResourcesToSeize = numberOfResourcesToSeize;
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(100);
        this.resources = resources || new Array<Resource>();
        this.simulation = simulation;
    }
    async seize(entity: Entity, resource: Resource = null): Promise<SimEvent> {



           


            if (resource && !this.resources.find(r => { return r.name === resource.name })) {
                this.resources.push(resource);
            }
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
 

            return simEvent.promise;

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
        this.simulation.recordEntityStat(entity,entity.runtime.enqueueTime,Allocations.wait);
        this.simulation.log(`${entity.name} dequeued`, "dequeue")
        if (this.queue.length > 0) {
            let nextEntity = this.queue.peek();
            this.eventEmitter.emit(nextEntity.name);
        }
    }


    leave(entity: Entity) {
        this.queue.leave(entity);
        this.eventEmitter.emit("queueChanged")
    }



    delay(entity: Entity, resource: Resource, processTimeDist: Distribution): Promise<SimEvent> {
        let processTime = this.simulation.addRandomValue(processTimeDist);
        let timeStampBefore = this.simulation.simTime;
        let simEvent =  this.simulation.setTimer(processTime, this.name, `${entity.name} processed by ${resource.name}`);
        resource.process(entity);       
        this.simulation.eventEmitter.once(simEvent.name,sEvent=>{
            this.simulation.recordEntityStat(entity,timeStampBefore,this.allocation);
        });
        return simEvent.promise
    }


    release(entity: Entity, resource: Resource) {
        //resource becomese idle, seizedBy becomes null
        //Should have other statistics also here
        resource.release(entity);
    }



    finalize(){
        this.queue.finalize();
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