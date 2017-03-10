
import {Entity} from './model/entity';
import {Station} from './model/station';
import {Route} from './model/route';
import {Resource} from './model/resource';
import {SimEvent} from './simEvent';
import {Process} from './tasks/process';


import {PriorityQueue} from './queues/priorityQueue';
import {AbstractQueue} from './queues/abstractQueue';
import {Queue} from './queues/queue';

import {Random} from './stats/random';
import {Units,Distributions,Distribution} from './stats/distributions';

import { Reporter } from './services/reporter';
import { Recorder } from './services/recorder';
import { Creator } from './services/creator';




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
  queue:PriorityQueue<SimEvent>;
  runtime:any;
  random:Random;
  simulationRecords:any[];
  logger:Function;

  reporter:Reporter;
  recorder:Recorder;
  creator : Creator;

  endTime:number;
  baseUnit:Units;
  eventEmitter:any;
  eventCount:number;
  unscheduledEvents:Map<number,SimEvent>;
  concurrentEvents:Promise<SimEvent>[];
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
    this.queue = new PriorityQueue<SimEvent>((queueItem1,queueItem2)=>  { return queueItem1.deliverAt < queueItem2.deliverAt });
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
    this.unscheduledEvents = new Map<number,SimEvent>();
    this.concurrentEvents = [];
 
    this.entityModels = new Map<string,any>();


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



scheduleEvent(simEvent:SimEvent,duration,message:string=null){
    simEvent.deliverAt = this.simTime+duration;
    //simEvent.scheduledAt = this.simTime;
    simEvent.message = message;
    simEvent.isScheduled = true;
    this.queue.add(simEvent);
    this.unscheduledEvents.delete(simEvent.id);
    this.concurrentEvents.push(simEvent.promise);
}


setTimer(duration:number=null, type:string = null,message:string=null) : SimEvent{

    let simEvent : SimEvent = null;
    if(duration){        
        simEvent = new SimEvent(this.simTime,this.simTime+duration,type,message);
        simEvent.isScheduled = true;
        this.queue.add(simEvent);
    }else{
        simEvent = new SimEvent(this.simTime,this.simTime,type,message);
        this.unscheduledEvents.set(simEvent.id,simEvent);
    }

    let p =  new Promise<SimEvent>((resolve,reject)=>{

            this.eventEmitter.once(simEvent.name,(event:SimEvent)=>{

                resolve(event);

            })


   })
   .then(e=>{
      return simEvent;
   });

   simEvent.promise = p;

    if(simEvent.isScheduled && simEvent.deliverAt === this.simTime){
        this.concurrentEvents.push(simEvent.promise);
    }

    return simEvent;


}

 async nextStep()  {
    
   
      if(this.queue.size ===0 )
      {
          this.finalize();
          this.eventEmitter.emit("done", true);
          return;
      }
      
      
      let event = this.queue.poll();
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


process(name:string) : Process{
    return this.creator.process(name);
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











