import { Queue, QueueTypes } from './queues/queue';
import { FifoQueue } from './queues/fifoQueue';
import { AbstractQueue } from './queues/abstractQueue';
import { Entity} from './model/entity';
import { Resource, ResourceStates } from './model/resource';
import { Simulation } from './simulation';
import { Distribution } from './stats/distributions';
import { SimEvent } from './simEvent';

 
let EventEmitter = require('events');


export class Process {


    queue: AbstractQueue<Entity>;
    resources: Array<Resource>;
    eventEmitter: any;
    numberOfResourcesToSeize: number;
    simulation: Simulation;
    name: string;
    innerProcess : Function;
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
        this.name = processModel.name;
        this.numberOfResourcesToSeize = numberOfResourcesToSeize;
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(100);
        this.resources = resources || new Array<Resource>();
        this.simulation = simulation;

        this.innerProcess = processModel.process || null;

    }


    process(entity: Entity, resource: Resource = null) {

        if(this.innerProcess)
        {
            this.innerProcess(entity, resource);
        }

    }


    seize(entity: Entity, resource: Resource = null): SimEvent {



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
                this.seizeFromResources(entity, simEvent);

            }
            else {
                //Listen for the one time the entity is in front....then seize
                this.eventEmitter.once(entity.name, () => {
                    this.seizeFromResources(entity, simEvent);

                })
            }


        return simEvent;


    }


    seizeFromResources(entity: Entity, simEvent: SimEvent){
        let idleResources = this.resources.filter(r => { return r.state === ResourceStates.idle });
        if (idleResources && idleResources.length > 0) {
                let resource = this.resources[0];
                resource.seize(entity);
                simEvent.result = new SeizeResult(entity, resource);
                this.simulation.scheduleEvent(simEvent, 0, `${entity.name} seized by ${this.resources[0].name}`);
                this.dequeue();
        }
        else {
            this.resources.forEach(r => {
              return  this.inner_seize(entity, r, simEvent);
            });
        }
    }

    inner_seize(entity: Entity, r: Resource, simEvent: SimEvent)  {
        r.emitter.once("idle", resource => {
            if (!simEvent.isScheduled) {
                resource.seize(entity);
                simEvent.result = new SeizeResult(entity, resource);
                this.simulation.scheduleEvent(simEvent, 0, `${entity.name} seized by ${this.resources[0].name}`);
                this.dequeue();
  
            }
        });
    }


    enqueue(entity: Entity) {
        this.queue.enqueue(entity);
        this.simulation.log(`${entity.name} enqueued`, "enqueue")

        this.eventEmitter.emit("enqueued")
    }


    dequeue() {
        let entity = this.queue.dequeue();
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


   /* trySeizeFromMany(entity: Entity, resources: Resource[]): Promise<SeizeResult> {
        let promises: Promise<SeizeResult>[] = [];
        resources.forEach(resource => {
            let p = this.trySeize(entity, resource);
            promises.push(p);
        });
        return Promise.race(promises);
    }



    trySeize(entity, resource: Resource): Promise<SeizeResult> {
        let promise = new Promise((resolve, reject) => {
            if (resource.state === ResourceStates.idle) {
                resolve(new SeizeResult(entity, [resource]));
            } else {
                resource.emitter.once("idle", resource => {
                    resolve(new SeizeResult(entity, [resource]));
                });
            }

        })
        return promise
    }*/

    delay(entity: Entity, resource: Resource, delay: Distribution): SimEvent {
        let processTime = this.simulation.addRandomValue(delay)
        return this.simulation.setTimer(processTime, this.name, `${entity.name} processed by ${resource.name}`);
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