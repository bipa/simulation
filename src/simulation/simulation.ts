
import {Entity,Allocations} from './model/entity';
import {IEntity} from './model/ientity';
import {Station} from './model/station';
import {Route} from './model/route';
import {Resource,ResourceStates} from './model/resource';
import {ISimulation} from './model/iSimulation';
import {SimEvent,ISimEvent,ISimEventResult} from './simEvent';


import {Process} from './tasks/process';

import {Statistics, StatisticsRecords} from './stats/statistics';


import { Queue, QueueTypes } from './queues/queue';
import { AbstractQueue } from './queues/abstractQueue';


import { FifoQueue } from './queues/fifoQueue';


import {Random} from './stats/random';
import {Units,Distributions,Distribution} from './stats/distributions';

import { Reporter } from './services/reporter';
import { Recorder } from './services/recorder';
import { Creator } from './services/creator';
import { Tasker } from './services/tasker';
import { Simulator } from './services/simulator';
import { ResourceBroker, ResourceRequest } from './services/resourceBroker';



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
  tasks:Tasker;

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
    this.tasks = new Tasker(this);

    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100);
    this.data = Object.assign({},model.data);
    this.variables = {};
    this.eventCount = 0;
 
    this.entityModels = new Map<string,any>();

    this.stations=model.stations;
    this.routes = model.routes;
    this.creator.createVariables(model.variables,this);
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

            if(entityModel.creation.dist==null&&entityModel.creation.runOnce==null) {
                entityModel.creation.runOnce=true;
                entityModel.creation.dist = {value:0,type:Distributions.Constant};
        
            }


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











