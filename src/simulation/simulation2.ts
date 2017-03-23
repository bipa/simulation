
import {Entity,Allocations} from './model/entity';
import {IEntity} from './model/ientity';
import {Station} from './model/station';
import {Route} from './model/route';
import {Resource,ResourceStates} from './model/resource';
import {ISimulation} from './model/iSimulation';
import {SimEvent,ISimEvent,ISimEventResult} from './simEvent';


import {Process} from './tasks/process';
import {Walk,WalkResult} from './tasks/walk';
import {Seize,SeizeResult} from './tasks/seize';
import {Delay,DelayResult} from './tasks/delay';
import {Enqueue,EnqueueResult} from './tasks/enqueue';
import {Dequeue,DequeueResult} from './tasks/dequeue';
import {Release,ReleaseResult} from './tasks/release';
import {Dispose,DisposeResult} from './tasks/dispose';

import {Statistics, StatisticsRecords} from './stats/statistics';


import { Queue, QueueTypes } from './queues/queue';
import { AbstractQueue } from './queues/abstractQueue';


import { FifoQueue } from './queues/fifoQueue';


import {Random} from './stats/random';
import {Units,Distributions,Distribution} from './stats/distributions';

import { Reporter } from './services/reporter';
import { Recorder } from './services/recorder';
import { Creator } from './services/creator';
import { Simulator } from './services/simulator';
import { ResourceBroker, ResourceRequest } from './services/resourceBroker';



var PD = require("probability-distributions");   
const EventEmitter = require('events');







  




export class Simulation implements ISimulation{

  variables:any;
  data:any;

  static epsilon : number = 0.00000001;

  simTime:number;

  entities:Entity[];
  entityModels: Map<string,any>;
  resources:Resource[];
  processes:Map<string,Process>;
  logRecords:any[];
  stations:Station[];
  routes:Route[];
  

  runtime:any;
  random:Random;
  simulationRecords:any[];
  logger:Function;

  reporter:Reporter;
  recorder:Recorder;
  creator : Creator;
  simulator: Simulator;
  resourceBroker:ResourceBroker;

  queues : Map<string,AbstractQueue<IEntity>>;

  endTime:number;
  baseUnit:Units;
  eventEmitter:any;
  eventCount:number;
  unscheduledEvents:Map<number,ISimEvent>;
  useLogging:boolean;
  currentSimEvent: ISimEvent;

  constructor(model : any) {
    this.useLogging = model.preferences.useLogging || false;
    this.random = new Random(model.preferences.seed);
    this.baseUnit = model.preferences.baseUnit || Units.Minute;
    this.simTime = 0;
    this.entities = [];
    this.resources = [];
    this.endTime = model.preferences.simTime || 1000;
    this.processes = new Map<string,Process>();
    this.queues = new Map<string,AbstractQueue<IEntity>>();
   
   
   
   
   this.runtime={};
    this.logRecords =[];
    this.simulationRecords = [];
    this.logger = model.preferences.logger ||this.defaultLogger;

    this.reporter = new Reporter(this);
    this.recorder = new Recorder(this);
    this.creator = new Creator(this);
    this.simulator = new Simulator(this);

    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100);
    this.data = Object.assign({},model.data);
    this.variables = {};
    this.createVariables(model.variables,this);
    this.eventCount = 0;
 
    this.entityModels = new Map<string,any>();

    this.stations=model.stations;
    this.routes = model.routes;
    this.creator.createVariables(model.variables,this);
    this.creator.createResources(model.entities);
    //this.creator.createProcesses(model.processes);
    this.creator.createEntities(model.entities);


    
    this.resourceBroker = new ResourceBroker(this);

  }

defaultLogger(message){
    if(this.useLogging)
        console.log(message);
}

report(){
    this.reporter.report();
}

log(message:string,type:string=null, entity:Entity=null){
     let newlogRec = {
                simTime:this.simTime,
                name:type,
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

nextStep2(){

}

 scheduleEvent2(simEvent:any,flag: any){

 }



 scheduleEvent(simEvent:ISimEvent){


    this.simulator.scheduleEvent(simEvent);
    
 }

setTimer<T>(delay,type=null,message=null) : SimEvent<T>{
    return null;
}


simulate(endTime = null, maxEvents = Number.POSITIVE_INFINITY ) : Promise<SimulationResult> {
     let promise = new Promise<SimulationResult>(async(resolve,reject)=>{
         this.eventEmitter.once("done",(success)=>{

            let simRes = new SimulationResult();
            simRes.logRecords  = this.logRecords;
            simRes.simulationRecords = this.simulationRecords;
            //simRes.statistics = this.recorder.statistics.report();
            
             resolve(simRes);
         });
         this.eventCount = 0;
         this.endTime = endTime || this.endTime;
         this.simulator.step();
    })
return promise;
  
   
}


 finalize() {

   

    this.recorder.finalizeEntityRecords();

    this.recorder.finalizeResourceRecords();

    this.recorder.finalizeProcessRecords();

   
  }




 setConventions(entityModel:any){
          
      if(!entityModel.creation){
          entityModel.creation = {
              dist:{
                  value:0,
                  type:Distributions.Constant
              },
              runOnce:true
          };
      }else{
          if(entityModel.creation.dist==null) entityModel.creation.dist = {value:0,type:Distributions.Constant};
          if(entityModel.creation.runOnce==null) entityModel.creation.runOnce = false;
          if(entityModel.creation.runBatch==null&&!entityModel.creation.batchsize) entityModel.creation.batchsize = 1;

      }
  }
  
      
addRandomValue(dist:Distribution){
    
    if(dist===null) return dist;
    
    //if dist is just a number, following the default scale
   // if(!(dist instanceof Object) && !(parseInt(dist).isNaN())) return dist;
    
    let scale = this.setTimeScale(dist.unit  || this.baseUnit);
    let value = null;
    
    switch (dist.type) {
      case Distributions.Constant:
        value  = dist.value*scale;
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


removeEntity(entity:Entity){
    let i = this.entities.indexOf(entity);
    this.entities.splice(i,1);
}

getEntitiesByType(type :string): Entity[]{
   return this.entities.filter(e=>{return e.type===type});
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
 
    walkTo(entity:Entity,to : Station,speed=1) : Promise<SimEvent<WalkResult>>{
        return this.walk(entity,entity.currentStation,to,speed);
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


    





    seizeOneFromManyResources(entity:Entity,resources:Resource[],quantity : number=1,priority:number=0) {



/*  let message = "";
            let seizeResult: SeizeResult;
      
      
            let idleResources = resources.filter(r => { return r.state === ResourceStates.idle });
            if (idleResources && idleResources.length > 0) {
                let resource = resources[0];
                this.currentSimEvent.type ="seize";
                this.currentSimEvent.message = `  ${entity.name} seized ${resource.name}`;
                this.currentSimEvent.deliverAt = this.simTime;
                this.currentSimEvent.currentResult = this.inner_seize(entity,resource);
                return  this.currentSimEvent.currentResult;
            }
            else {
                 resources.forEach(r => {
                    this.seizeOnIdle(entity,r,this.currentSimEvent);
                 });
                this.currentSimEvent.onHold = true;
            }*/


           let req = this.resourceBroker.addRequest(this.currentSimEvent,entity,resources,quantity,priority);


            if(req.isDone)
            {
                return req.seizeResult;
            }

    }





          
  
 
       seizeOnIdle(entity: Entity, resource: Resource,simEvent : ISimEvent){  
                   
            resource.emitter.once("idle", (resource : Resource) => {


                
                     simEvent.type ="seize";
                     simEvent.message = `  ${entity.name} seized ${resource.name}`;
                     simEvent.deliverAt = this.simTime;
                     simEvent.currentResult = this.inner_seize(entity,resource);
                     this.simulator.scheduleEvent(simEvent);

             
             
            });
            
        }
   inner_seize(entity: Entity, resource: Resource, 
                           ) :SeizeResult {
                resource.seize(entity);
                return new SeizeResult(entity, resource);
    }









































    seizeResource(entity:Entity,resource:Resource) : Promise<SeizeResult>{

        //Creates a new wueue each time
            return Seize.seize(this,entity,[resource],1);


    }

    release(entity:Entity,resource:Resource) {
          

            this.currentSimEvent.type ="release";
            this.currentSimEvent.message = `${entity.name} released ${resource.name}`;
            this.currentSimEvent.currentResult = new ReleaseResult(entity,resource);
            //yield;
            resource.idle();

    }


    *delay(entity: Entity, resource: Resource, processTimeDist: Distribution,allocation:Allocations = Allocations.valueAdded){
            let processTime = this.addRandomValue(processTimeDist);
            let timeStampBefore = this.simTime;
            this.currentSimEvent.deliverAt = this.simTime+processTime;
            this.currentSimEvent.type ="delay";
            this.currentSimEvent.message = `  ${entity.name} processed by ${resource.name}`;
                     
            resource.process(entity);
            yield;       
            this.recorder.recordEntityStat(entity,timeStampBefore,allocation);
    }


    enqueue(entity: Entity,queue :AbstractQueue<IEntity>) {
       
      /*  let simEvent = new SimEvent<EnqueueResult>(this.simTime,this.simTime,"front",`  ${entity.name} is now in front of ${queue.name}`);
            
            simEvent.result = new EnqueueResult(entity);
*/


            queue.enqueue(entity);
            if (queue.length == 1) {  
                
                this.currentSimEvent.type ="front";
                this.currentSimEvent.message = `  ${entity.name} is now in front of ${queue.name}`;
                
            }
            else{
                 //Listen for the one time the entity is in front....then seize
                //set this currentSimEvent on HOLD, we dont know when its scheduled
                let simEvent = this.currentSimEvent;
                queue.eventEmitter.once(entity.name,  () => {   

                     simEvent.type ="front";
                     simEvent.message = `  ${entity.name} is now in front of ${queue.name}`;
                     simEvent.deliverAt = this.simTime;
                     this.simulator.scheduleEvent(simEvent);
                    
            
                });
                this.currentSimEvent.onHold = true;
             }

           
        

    }

    *dequeue(entity: Entity,queue :AbstractQueue<IEntity>){
        
            this.currentSimEvent.currentResult = new DequeueResult(entity);   
            this.currentSimEvent.type ="dequeue";
            this.currentSimEvent.message = `${entity.name} has dequeued ${queue.name}`;
            yield;
            queue.dequeue();
            this.recorder.recordEntityStat(entity,entity.lastEnqueuedAt,Allocations.wait);

           
          
           
           
    }


    dispose(entity:Entity){
    
            this.currentSimEvent.currentResult = new DisposeResult(entity);   
            this.currentSimEvent.type ="dispose";
            this.currentSimEvent.message = `${entity.name} is disposed`;
           
            entity.dispose(this.simTime);
            this.recorder.recordEntityDispose(entity);
            this.removeEntity(entity);
            
    }


















        createVariables(variables, ctx){
                for(let variableName in variables) 
                {
                    if(variableName!=="existing")
                    {
                             if(Object.keys(variables[variableName]).length>0)
                            {

                                this.variables[variableName] = {};

                                    for(let subVariableName in variables[variableName]) 
                                    {
                                        if(variableName=="noLog")
                                        {
                                                this.variables[variableName][subVariableName]=
                                                variables[variableName][subVariableName];
                                        }
                                        else{
                                            this.createVariable(this.variables[variableName],
                                            subVariableName,
                                            variables[variableName][subVariableName],ctx)
                                        }
                                        
                                    }
                            }else{
                                    this.createVariable(this.variables,
                                    variableName,
                                    variables[variableName],ctx)
                            }
                      }
                      else{
                            variables[variableName].forEach(variable=>{
                                this.recorder.addExistingVariable(variable);


                            })
                      }
                      
                }
        }


        createVariable(obj,propName, initValue,ctx){
                let vValue=initValue;
                 Object.defineProperty(
                     obj
                     ,propName
                     ,{
                          get: function() { return vValue; },
                     set: function(value) {
                         vValue = value;
                         ctx.simulationRecords.push(
                             {
                                 simtime:ctx.time(),
                                 name:propName,
                                 value:value
                             }
                         )}
                        }
                )
        }


    allocate(to:any[],from:any[],callback:Function){
        
        //Should assume to has mor eelements than from
        let counter=0;
        to.forEach(t=>{
            callback(t,from[counter]);
            counter++
        })

    }

 allocateToProperty(to:Entity[],from:Entity[],property:string){
        
        //Should assume to has mor eelements than from

        if(to.length>from.length) throw Error("AllocateToPropertError");

        let counter=0;
        to.forEach(t=>{

            let res = from[counter];
           t.runtime[property] = res;
           if(res instanceof Resource)
                (res as Resource).seize(t);
            counter++
        })

    }








 static createOppositeRoutes(routes: Route[]){
     let oRoutes : Route[] =[ ];
     routes.forEach(r=>{
         let oR = new Route(r.to,r.from,r.distance);
         oRoutes.push(oR);
     })
     let routs = routes.concat(oRoutes);

     return routs;
 }









static routes(routes:Route[], stations : Station[]): Route[]{
   let oppRoutes =  this.createOppositeRoutes(routes);
   let nullRoutes  = this.createNullRoutes(stations);

   let all = oppRoutes.concat(nullRoutes);

   return all;
}

 static stations(stations: any) : Station[]{
    return this.getFromData<Station>(stations);
 }



 static getFromData<T>(obj : any, predicate:Function =null) : T[]
 {  
     let a : T[] = [];

    for(let o in obj){
        let value = obj[o];
        if(predicate)
        {
            if(predicate(value)){
                a.push(value);
            }
        }else{
            a.push(value);
        }
    }

    return a;
 }


static createNullRoutes(stations : Station[]) : Route[]{
   let oRoutes : Route[] =[ ];
     stations.forEach(r=>{
         let oR = new Route(r,r,0);
         oRoutes.push(oR);
     })

     return oRoutes;
}



}





export class Variable{
    type:string;
    variable : ExistingVariables;
    name:string;


}
 export enum ExistingVariables{
        entityTotalValueAddedTime=0,
        entityTotalNonValueAddedTime,
        entityTotalWaitTime,
        entityTotalTransferTime,
        entityTotalOtherTime,

        entityTotalValueAddedTimePercentage,
        entityTotalNonValueAddedTimePercentage,
        entityTotalWaitTimePercentage,
        entityTotalTransferTimePercentage,
        entityTotaOtherTimePercentage,

        resourceTotalInstantaneousUtilization,

        resourceTotalIdleTime,
        resourceTotalBusyTime,
        resourceTotalTransferTime,

        resourceTotalIdleTimePercentage,
        resourceTotalBusyTimePercentage,
        resourceTotalTransferTimePercentage,
 }


export class SimulationResult{
    simulationRecords:SimulationRecord[];
    logRecords: LogRecord[];
    statistics:StatisticsRecords;
}





export class LogRecord{

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











