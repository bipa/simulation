
import {Entity,Allocations} from './model/entity';
import {IEntity} from './model/ientity';
import {Station} from './model/station';
import {Route} from './model/route';
import {Resource} from './model/resource';
import {SimEvent,ISimEvent,ISimEventResult} from './simEvent';


import {Process} from './tasks/process';
import {Walk,WalkResult} from './tasks/walk';
import {Seize,SeizeResult} from './tasks/seize';
import {Delay,DelayResult} from './tasks/delay';
import {Enqueue,EnqueueResult} from './tasks/enqueue';
import {Dequeue,DequeueResult} from './tasks/dequeue';
import { Queue, QueueTypes } from './queues/queue';
import { AbstractQueue } from './queues/abstractQueue';


import {PriorityQueue} from './queues/priorityQueue';
import { FifoQueue } from './queues/fifoQueue';


import {Random} from './stats/random';
import {Units,Distributions,Distribution} from './stats/distributions';

import { Reporter } from './services/reporter';
import { Recorder } from './services/recorder';
import { Creator } from './services/creator';




var PD = require("probability-distributions");   
const EventEmitter = require('events');







 




export class Simulation{

  variables:any;
  data:any;

  simTime:number;

  entities:Set<Entity>;
  entityModels: Map<string,any>;
  resources:Resource[];
  processes:Map<string,Process>;
  logRecords:any[];
  stations:Station[];
  routes:Route[];
  _queue:PriorityQueue<ISimEvent>;
  runtime:any;
  random:Random;
  simulationRecords:any[];
  logger:Function;

  reporter:Reporter;
  recorder:Recorder;
  creator : Creator;

  queues : Map<string,AbstractQueue<IEntity>>;

  endTime:number;
  baseUnit:Units;
  eventEmitter:any;
  eventCount:number;
  unscheduledEvents:Map<number,ISimEvent>;
  concurrentEvents:Promise<any>[];
  useLogging:boolean;

  constructor(model : any) {
    this.useLogging = model.preferences.useLogging || false;
    this.random = new Random(model.preferences.seed);
    this.baseUnit = model.preferences.baseUnit || Units.Minute;
    this.simTime = 0;
    this.entities = new Set<Entity>();
    this.resources = [];
    this.endTime = model.preferences.simTime || 1000;
    this.processes = new Map<string,Process>();
    this.queues = new Map<string,AbstractQueue<IEntity>>();
    this._queue = new PriorityQueue<ISimEvent>((queueItem1,queueItem2)=>  { return queueItem1.deliverAt < queueItem2.deliverAt });
    this.runtime={};
    this.logRecords =[];
    this.simulationRecords = [];
    this.logger = model.preferences.logger ||this.defaultLogger;

    this.reporter = new Reporter();
    this.recorder = new Recorder(this);
    this.creator = new Creator(this);


    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100);
    this.data = Object.assign({},model.data);
    this.variables = {};
    this.eventCount = 0;
    this.unscheduledEvents = new Map<number,ISimEvent>();
    this.concurrentEvents = [];
 
    this.entityModels = new Map<string,any>();

    this.creator.createstations(model.stations);
    this.creator.createVariables(model.variables,this);
    this.creator.createResources(model.entities);
    //this.creator.createProcesses(model.processes);
    this.creator.createEntities(model.entities);

  }

defaultLogger(message){
    if(this.useLogging)
        console.log(message);
}

report(){
    this.reporter.report(this);
}

log(message:string,type:string=null, entity:Entity=null){
     let newlogRec = {
                simTime:this.simTime,
                name:message,
                message:message
            };
            this.logRecords.push(newlogRec);
   if (!this.logger) return;
    let entityMsg = '';

    if (type) {
        entityMsg = ` [${type}]`;
    }
  
  
    this.logger(`${this.simTime.toFixed(3)}${entityMsg}   ${message}`);
}



scheduleEvent(simEvent:ISimEvent,duration,message:string=null){
    simEvent.deliverAt = this.simTime+duration;
    //simEvent.scheduledAt = this.simTime;
    simEvent.message = message;
    simEvent.isScheduled = true;
    this._queue.add(simEvent);
    this.unscheduledEvents.delete(simEvent.id);
    this.concurrentEvents.push(simEvent.promise);
}


setTimer<T extends ISimEventResult>(duration:number=null, type:string = null,message:string=null) : SimEvent<T>{

    let simEvent : SimEvent<T> = null;
    if(duration){        
        simEvent = new SimEvent<T>(this.simTime,this.simTime+duration,type,message);
        simEvent.isScheduled = true;
        this._queue.add(simEvent);
    }else{
        simEvent = new SimEvent<T>(this.simTime,this.simTime,type,message);
        this.unscheduledEvents.set(simEvent.id,simEvent);
    }

    let k =  new Promise<T>((resolve,reject)=>{

            this.eventEmitter.once(simEvent.name,(event:SimEvent<T>)=>{

                resolve(event.result);

            })
    }).then(e=>{
      return simEvent.result;
   });
 
   simEvent.promise = k; 

    if(simEvent.isScheduled && simEvent.deliverAt === this.simTime){
        this.concurrentEvents.push(simEvent.promise);
    }

    return simEvent;


}

 async nextStep()  {
    
   
      if(this._queue.size ===0 )
      {
          this.finalize();
          this.eventEmitter.emit("done", true);
          return;
      }
      
      
      let event = this._queue.poll();
      this.simTime = event.deliverAt;
      if (event.deliverAt > this.endTime)  {
          this.finalize();
          this.eventEmitter.emit("done", true);
          return;
      };
      this.eventCount++;
      this.simTime = event.deliverAt;
      this.log(event.message,event.type);
      //if(this.eventCount>1)
    this.eventEmitter.emit(event.name, event);
        
        
      if(this.concurrentEvents.length>0){
            let r   = await Promise.all(this.concurrentEvents);
            this.concurrentEvents.length = 0;
            this.nextStep();

      }else{
          let res = await event.promise;
          this.nextStep();
      }
    
     

}
simulate(endTime = null, maxEvents = Number.POSITIVE_INFINITY ) : Promise<boolean> {
     let promise = new Promise<boolean>(async(resolve,reject)=>{
         this.eventEmitter.once("done",(success)=>{
             resolve(success);
         });
         this.eventCount = 0;
         this.endTime = endTime || this.endTime;
         this.nextStep();
    })
return promise;
  
   
}


 finalize() {

   

    this.recorder.finalizeEntityRecords();

    this.recorder.finalizeResourceRecords();

    this.recorder.finalizeProcessRecords();

   
  }



dispose(entity:Entity){
  
    //keep some stats here
    entity.dispose(this.simTime);
    this.recorder.recordEntityDispose(entity);
    this.entities.delete(entity);
}




  
      
addRandomValue(dist:Distribution){
    
    if(dist===null) return dist;
    
    //if dist is just a number, following the default scale
   // if(!(dist instanceof Object) && !(parseInt(dist).isNaN())) return dist;
    
    let scale = this.setTimeScale(dist.unit  || this.baseUnit);
    let value = null;
    
    switch (dist.type) {
      case Distributions.Constant:
        value  = dist.param1*scale;
        break;
      case Distributions.Exponential:
        value= this.random.exponential(1.0/(dist.param1*scale));
        break;
      case Distributions.Triangular:
        value= this.random.triangular(dist.param1*scale,dist.param2*scale,dist.param3*scale);
        break;
    
      default:
        break;
    }
    
    
    return value;
    
    
    
    
    
    
}



//Should be put private
     setTimeScale(unit:Units){
         
          switch (unit) {
            case Units.Minute:
              return 1;
            case Units.Hour:
              return 60;
            case Units.Day:
              return 60*24;
            case Units.Week:
              return 7*60*24;
          
            default:
            case Units.Minute:
              return 1;
          }
    }
        


createQueue(name : string,queueType:QueueTypes = QueueTypes.fifo) : AbstractQueue<IEntity>{
    
        if(this.queues.has(name)) return this.queue(name);

        let queue: AbstractQueue<IEntity>;
    
        switch (queueType) {
            case QueueTypes.fifo:
                queue = new FifoQueue<IEntity>(this);
                break;
            default:
                queue = new FifoQueue<IEntity>(this);
           
               break;
        }
        this.queues.set(name,queue);
        return queue; 
}

queue(name:string,queueType:QueueTypes = QueueTypes.fifo) : AbstractQueue<IEntity>{
    if(!this.queues.has(name)) return this.createQueue(name,queueType);
    return this.queues.get(name);
}



process(name:string) : Process{
    return this.creator.process(name);
}

station(name:string) : Station{
    return this.creator.station(name);
}


route(from:Station, to :Station) : Route{
    return this.creator.route(from,to);
}


//Tasks

    walkEvent(entity:Entity,from:Station,to : Station,speed=1): SimEvent<WalkResult>{
        return Walk.walkEvent(this,entity,from,to,speed);
    }


    walk(entity:Entity,from:Station,to : Station,speed=1) : Promise<SimEvent<WalkResult>>{
        return Walk.walk(this,entity,from,to,speed);
    }


    /*all(event1:SimEvent, event2 : SimEvent) : Promise<SimEvent>
    {
       return  event1.deliverAt<event2.deliverAt ? event2.promise : event1.promise;
    }*/


    yesNo(probability : number) : boolean
    {

             let sampleProb = PD.rbinom(1,1,probability);
             return sampleProb[0]==1 ? true : false;
    }


    splitDurationRandomly(duration : Distribution, count: number=2) : Distribution[]
    {
        let dists : Distribution[]  = [];

        let totalDuration = this.addRandomValue(duration);

        let splits = PD.runif(count-1,0,1);

        splits.forEach(splitRatio=>{
            let d = totalDuration*splitRatio;
            totalDuration -=d;
            let newDist = new Distribution(Distributions.Constant, duration.unit,d);
            dists.push(newDist);
            
        })

        let lastDist = new Distribution(Distributions.Constant, duration.unit,d);
        dists.push(lastDist);


        return dists;


    }

    seizeDelayRelease() : Promise<SimEvent<SeizeResult>>{
        return null;
    }


    seizeOneFromManyResources(entity:Entity,resources:Resource[]) : Promise<SeizeResult>{

            return Seize.seize(this,entity,resources,1);
    }

    seizeResource(entity:Entity,resource:Resource) : Promise<SeizeResult>{

        //Creates a new wueue each time
            return Seize.seize(this,entity,[resource],1);


    }



    delay(entity: Entity, resource: Resource, processTimeDist: Distribution,allocation:Allocations = Allocations.valueAdded): Promise<DelayResult>{
       return Delay.delay(this,entity,resource,processTimeDist,allocation);
    }


    enqueue(entity: Entity,queue :AbstractQueue<IEntity>): Promise<EnqueueResult>{
        return Enqueue.enqueue(this,entity,queue);
    }

    dequeue(entity: Entity,queue :AbstractQueue<IEntity>): Promise<DequeueResult>{
        return Dequeue.dequeue(this,entity,queue);
    }


}


















export class SimulationRecord{
    simTime:number;
    name:string;
    value:number;

    constructor(simTime:number,name:string,value:number){
        this.simTime = simTime;
        this.name= name;
        this.value = value;
    }
}











