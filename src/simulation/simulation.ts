import {Queue} from './queues/queue';
import {AbstractQueue} from './queues/abstractQueue';
import {Entity} from './model/entity';
import {Station} from './model/station';
import {Route} from './model/route';
import {Resource, ResourceStates, ScheduledStates} from './model/resource';
import {PriorityQueue} from './queues/priorityQueue';
import {Random} from './stats/random';
import {SimEvent} from './simEvent';
import {Process} from './tasks/process';
import {Population,DataSeries,TimeSeries} from './stats/dataRecorder';
import {DataRecord} from './stats/dataRecord';
import {Units,Distributions,Distribution} from './stats/distributions';
import {Statistics} from './stats/statistics';
import {EntityStats} from './stats/entityStats';
import {ResourceStats} from './stats/resourceStats';
import {QueueStats} from './stats/queueStats';
import { Allocations } from './model/allocations';
import { Reporter } from './services/reporter';




const EventEmitter = require('events');







 




export class Simulation{


  simTime:number;
  entities:Set<Entity>;
  entityModels: Map<string,any>;
  resources:Resource[];
  processes:Map<string,Process>;
  logRecords:any[];
  stations:Station[];
  routes:Route[];
  stats:Statistics;
  queue:PriorityQueue<SimEvent>;
  runtime:any;
  random:Random;
  simulationRecords:any[];
  logger:Function;
  reporter:Reporter;
  endTime:number;
  baseUnit:Units;
  eventEmitter:any;
  data:any;
  eventCount:number;
  unscheduledEvents:Map<number,SimEvent>;
  concurrentEvents:Promise<SimEvent>[];
  variables:any;
  useLogging:boolean;
  statistics:Statistics;

  constructor(model : any) {
    this.useLogging = model.useLogging || false;
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
    this.logger = this.defaultLogger;
    this.reporter = new Reporter();
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(100);
    this.data = Object.assign({},model.data);
    this.variables = {};
    this.createVariables(model.variables,this);
    this.eventCount = 0;
    this.unscheduledEvents = new Map<number,SimEvent>();
    this.concurrentEvents = [];
    this.statistics = new Statistics();
 
    this.entityModels = new Map<string,any>();
    this.createResources(model.resources);
    this.createProcesses(model.processes);
    this.createEntities(model.entities);

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
                simTime:this.time(),
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


  time() {
    return this.simTime;
  }

scheduleEvent(simEvent:SimEvent,duration,message:string=null){
    simEvent.deliverAt = this.time()+duration;
    //simEvent.scheduledAt = this.time();
    simEvent.message = message;
    simEvent.isScheduled = true;
    this.queue.add(simEvent);
    this.unscheduledEvents.delete(simEvent.id);
    this.concurrentEvents.push(simEvent.promise);
}


setTimer(duration:number=null, type:string = null,message:string=null) : SimEvent{

    let simEvent : SimEvent = null;
    if(duration){        
        simEvent = new SimEvent(this.time(),this.time()+duration,type,message);
        simEvent.isScheduled = true;
        this.queue.add(simEvent);
    }else{
        simEvent = new SimEvent(this.time(),this.time(),type,message);
        this.unscheduledEvents.set(simEvent.id,simEvent);
    }

    let p =  new Promise<SimEvent>((resolve,reject)=>{

            this.eventEmitter.once(simEvent.name,(event:SimEvent)=>{

                resolve(event);

            })


   }).then(e=>{
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
        
      /*this.log(`Count simulation listeners EVENTACTIVE:  ${this.eventEmitter.listenerCount("eventActive")}`,)
      this.log(`Count process listeners QUEUECHANGED:  ${this.processes[0].eventEmitter.listenerCount("queueChanged")}`,)
      this.log(`Count resource listeners IDLE:  ${this.resources[0].emitter.listenerCount("idle")}`,)*/
      
      //event.deliver();
      
      
      //let res = await event.promise;
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

    //WIP
    this.entities.forEach(entity=>{
        if (entity.finalize) {
          entity.finalize();
      }
      let entityModel = this.entityModels.get(entity.type);
      if(entityModel.recordWip){
          this.recordEntityStats(entity);
      }
    });

    this.statistics.resourceStats.forEach(resStat=>{
    resStat.numberScheduled.record(resStat.currentScheduled,this.simTime-resStat.lastRecordedTime);
    resStat.numberBusy.record(resStat.currentBusy,this.simTime-resStat.lastRecordedTime);

    if(resStat.currentScheduled===0)
    {
         resStat.instantaneousUtilization.record(0, this.simTime-resStat.lastRecordedTime)
    
    }
    else{
        resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simTime-resStat.lastRecordedTime)
    
    }

})


this.resources.forEach(resource=>{
    
         let resStat =  this.resourceStats(resource);
         let duration = this.simTime - resource.lastStateChangedTime;

        switch (resource.state) {
            case ResourceStates.idle:
                //The resource IS NOT IDLE ANYMORE
                resource.idleTime+=duration;
                resStat.totalIdleTime+=duration;
                break;
            case ResourceStates.busy:
                //The resource IS NOT IDLE ANYMORE
                resource.busyTime+=duration;
                resStat.totalBusyTime+=duration;

                break;
            case ResourceStates.transfer:
                //The resource IS NOT IDLE ANYMORE
                resource.transferTime+=duration;
                resStat.totalTransferTime+=duration;
                break;
            case ResourceStates.broken:
                //The resource IS NOT IDLE ANYMORE
                resource.brokenTime+=duration;
                resStat.totalBrokenTime+=duration;
                break;
            case ResourceStates.seized:
                //The resource IS NOT IDLE ANYMORE
                //resource+=this.simTime - resource.lastStateChangedTime;
                break;
            case ResourceStates.other:
                //The resource IS NOT IDLE ANYMORE
                resource.otherTime+=duration;
                resStat.totalOtherTime+=duration;
                break;
        
            default:
                break;
        }
        
        if(resource.scheduledState===ScheduledStates.scheduled)
        {
            
            resStat.totalScheduledTime += this.simTime-resStat.lastScheduledTime;
        }
})

    this.processes.forEach(p=>{
        p.finalize();
       // this.reportProcess(p);
    });
  }




dispose(entity:Entity){
  
    //keep some stats here
    entity.dispose(this.time());
    this.entityStats(entity).countStats.leave(entity.timeEntered,this.simTime);
    this.entityStats(entity).totalTime.record(entity.timeLeft  - entity.timeEntered);
    this.recordEntityStats(entity);
                
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
        


createProcesses(processModels:any[]){
  processModels.forEach(processModel=>{
      let process = new Process(this,processModel);
      this.runtime[processModel.name] = process;
      this.processes.set(process.name,process);
  });
}

process(name : string):Process{
    let process =  this.processes.get(name);
    return process;
}

 

//Create Entities

  createEntities(entityModels:any[]){
    entityModels.forEach(entityModel=>{
        this.entityModels.set(entityModel.type,entityModel);
      this.statistics.entityStats.set(entityModel.type,new EntityStats(entityModel.type));
      this.setConventions(entityModel);
      this.scheduleNextCreation(entityModel);
    })
  }




 async scheduleNextCreation(entityModel:any){

          let createAt = this.addRandomValue(entityModel.creation.dist);
          this.setTimer(createAt,"creation",entityModel.name).promise.then((simEvent)=>{
                        this.createModel(entityModel);

                    })
}


 setConventions(entityModel:any){
          
      if(!entityModel.creation){
          entityModel.creation = {
              dist:{
                  value:0
              },
              runOnce:true
          };
      }else{
          if(entityModel.creation.dist==null) entityModel.creation.dist = {value:0};
          if(entityModel.creation.runOnce==null) entityModel.creation.runOnce = false;
          if(entityModel.creation.runBatch==null&&!entityModel.creation.batchsize) entityModel.creation.batchsize = 1;

      }
  }

async createModel(entityModel){
          
          this.createEntityInstance(entityModel);
          
            if(!entityModel.creation.runOnce)
            {
                if(entityModel.creation.repeatInterval){
                    
                    let repeatInterval = this.addRandomValue(entityModel.creation.repeatInterval);
                    this.setTimer(repeatInterval,"creation",entityModel.name).promise.then((simEvent)=>{
                        this.createModel(entityModel);
                        
                        

                    })
                    
                }
                else{
                    this.scheduleNextCreation(entityModel);
                }
            }
            
      }




createEntityInstance(entityModel){
            if(entityModel.creation.runBatch){
                let modelInstances  = [];
                for (let i = 0; i < entityModel.creation.batchSize; i++) {
                    
                   this.entities.add( this.createSingleItem(entityModel));
                    
                }
            }
            else{
                this.entities.add(this.createSingleItem(entityModel));
            }
            
            
        }


createSingleItem(entityModel) : Entity{
                 let entityInstance = new Entity(entityModel);
                  this.addEvents(entityModel,entityInstance);
                  this.entityStats(entityInstance).countStats.enter(this.simTime);
                  entityInstance.timeEntered = this.simTime;
                  if(entityModel.creation.onCreateModel) entityModel.creation.onCreateModel(entityInstance,this);
                return entityInstance;
            }


addEvents(entityModel,modelInstance){
          
          
           //Should be SET AFTER the creation of an element
            if(entityModel.plannedEvents)
                entityModel.plannedEvents.forEach(async  plannedEvent=>{
                    
                    // let plannedEvent = new PlannedEvent(e);
                    // this.model.addPlannedEvent(plannedEvent);
                    plannedEvent.logMessage = plannedEvent.logMessage || plannedEvent.name;
                    let startTime = this.addRandomValue(plannedEvent.dist);
                    await this.setTimer(startTime).promise
                            this.schedulePlannedEvent(plannedEvent,modelInstance);
                    
                    
                });
            
            if(entityModel.randomEvents)
                entityModel.randomEvents.forEach(async randomEvent=>{
                    
                    // let randomEvent = new RandomEvent(e);
                    // this.model.addRandomEvent(randomEvent);
                    randomEvent.logMessage = randomEvent.logMessage || randomEvent.name;
                    if(randomEvent.numberOfRuns)
                    {
                        let next = 0;
                        for (var i = 0; i < randomEvent.numberOfRuns; i++) {
                           
                                next+= this.addRandomValue(randomEvent.dist);
                                await this.setTimer(next).promise
                                    this.randomEventOccured(randomEvent,modelInstance);
                                
                        }
                    }
                    else{
                        let startTime = this.addRandomValue(randomEvent.dist);
                        await this.setTimer(startTime).promise
                                    this.scheduleRandomEvent(randomEvent,modelInstance);
                        
                    }
                    
                    
                    
                    
                });
            
          
      }
      
   async schedulePlannedEvent(plannedEvent,modelInstance){
            
            
            //Schedule the next plannedEvent
            let repeatInterval = this.addRandomValue(plannedEvent.repeatInterval);
            
            let res =await this.setTimer(repeatInterval).promise
                
                 this.schedulePlannedEvent(plannedEvent,modelInstance);
                //Log the execution of the planned event
                if(plannedEvent.logEvent) this.log(plannedEvent.logMessage);
                //Execute the planned event
                plannedEvent.action(modelInstance,this);
           
            
            
            
            
        }
        
       async scheduleRandomEvent(randomEvent,modelInstance){
            
            //Schedule the next plannedEvent
            let nextEventAt = this.addRandomValue(randomEvent.dist);
            this.randomEventOccured(randomEvent,modelInstance);
         
            let res =await this.setTimer(nextEventAt).promise;
                    this.scheduleRandomEvent(randomEvent,modelInstance);
             
            
            
        }
        
        randomEventOccured(randomEvent,modelInstance){
            
            if(randomEvent.logEvent) this.log(randomEvent.logMessage);
            randomEvent.action(modelInstance,this);
        }






createResources(resourceModels: any[]){
    resourceModels.forEach(resourceModel=>{

            let instanceCount = resourceModel.quantity || 1;
            for(let i =0;i<instanceCount;i++){
                    let resource = new Resource(resourceModel);  
                   
                    this.resources.push(resource);
                    if(instanceCount===1){
                        this.runtime[resource.name] = resource;
                    };
                    this.addResourceStateListeners(resource);

            }
            let res = new ResourceStats(resourceModel.type);
            res.currentScheduled = instanceCount;
            this.statistics.resourceStats.set(resourceModel.type,res);
            
            
    });
}



addResourceStateListeners(resource:Resource){
    
    resource.emitter.on("onBeforeResourceStateChanged",this.onBeforeResourceStateChanged);
    resource.emitter.on("unScheduled",this.onUnScheduled);
    resource.emitter.on("scheduled",this.onScheduled);
    resource.emitter.on("onResourceBusy",this.onResourceBusy);
}


onResourceBusy=(resource:Resource)=>{
    
                let resStat =  this.resourceStats(resource);
                resStat.numberBusy.record(resStat.currentBusy,this.simTime-resStat.lastRecordedTime);

                if(resStat.currentScheduled===0)
                {
                    resStat.instantaneousUtilization.record(0, this.simTime-resStat.lastRecordedTime)
                
                }
                else{
                    resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simTime-resStat.lastRecordedTime)
                
                }
                resStat.lastRecordedTime = this.simTime;
                resStat.currentBusy++;
}

onBeforeResourceStateChanged=(resource:Resource)=>{
    
         let resStat =  this.resourceStats(resource);
         let duration = this.simTime - resource.lastStateChangedTime;

        switch (resource.state) {
            case ResourceStates.idle:
                //The resource IS NOT IDLE ANYMORE
                resource.idleTime+=duration;
                resStat.totalIdleTime+=duration;
                break;
            case ResourceStates.busy:
                //The resource IS NOT IDLE ANYMORE
                resource.busyTime+=duration;
                resStat.totalBusyTime+=duration;
                resStat.numberBusy.record(resStat.currentBusy,this.simTime-resStat.lastRecordedTime);

                if(resStat.currentScheduled===0)
                {
                    resStat.instantaneousUtilization.record(0, this.simTime-resStat.lastRecordedTime)
                
                }
                else{
                    resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simTime-resStat.lastRecordedTime)
                
                }
                resStat.lastRecordedTime = this.simTime;
                resStat.currentBusy--;
                break;
            case ResourceStates.transfer:
                //The resource IS NOT IDLE ANYMORE
                resource.transferTime+=duration;
                resStat.totalTransferTime+=duration;
                break;
            case ResourceStates.broken:
                //The resource IS NOT IDLE ANYMORE
                resource.brokenTime+=duration;
                resStat.totalBrokenTime+=duration;
                break;
            case ResourceStates.seized:
                //The resource IS NOT IDLE ANYMORE
                //resource+=this.simTime - resource.lastStateChangedTime;
                break;
            case ResourceStates.other:
                //The resource IS NOT IDLE ANYMORE
                resource.otherTime+=duration;
                resStat.totalOtherTime+=duration;
                break;
        
            default:
                break;
        }
        
        resource.lastStateChangedTime  = this.simTime;
}




onUnScheduled = (resource:Resource)=>{

    let resStat =  this.resourceStats(resource);
    resStat.numberScheduled.record(resStat.currentScheduled,this.simTime-resStat.lastRecordedTime);
    
    resStat.totalScheduledTime += this.simTime-resStat.lastScheduledTime;

    resStat.numberBusy.record(resStat.currentBusy,this.simTime-resStat.lastRecordedTime);
    resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simTime-resStat.lastRecordedTime)
    
    resStat.lastScheduledTime = this.simTime;
    resStat.lastRecordedTime = this.simTime;
    resStat.currentScheduled--;


}
onScheduled = (resource:Resource)=>{
    let resStat =  this.resourceStats(resource);
    
    resStat.numberScheduled.record(resStat.currentScheduled,this.simTime-resStat.lastRecordedTime);
    resStat.numberBusy.record(resStat.currentBusy,this.simTime-resStat.lastRecordedTime);

    if(resStat.currentScheduled===0)
    {
         resStat.instantaneousUtilization.record(0, this.simTime-resStat.lastRecordedTime)
    
    }
    else{
        resStat.instantaneousUtilization.record(resStat.currentBusy/resStat.currentScheduled, this.simTime-resStat.lastRecordedTime)
    
    }

    resStat.lastScheduledTime = this.simTime;
    resStat.lastRecordedTime = this.simTime;
    resStat.currentScheduled++;

}



resource(name : string) : Resource{
    let r = this.resources.find(r=>{return r.name === name});
    return r;
}



 createVariables(variables, ctx){
                for(let variableName in variables) 
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
                             new SimulationRecord( ctx.time(), propName,value)
                         )}
                        }
                )
        }



  recordEntityStat(entity:Entity,timeStampBefore : number,allocation : Allocations = Allocations.valueAdded){

        switch (allocation) {
            case Allocations.valueAdded:
                entity.valueAddedTime += this.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.wait:
                entity.waitTime += this.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.nonValueAdded:
                entity.nonValueAddedTime += this.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.transfer:
                entity.transferTime += this.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
            case Allocations.other:
                entity.otherTime += this.simTime - timeStampBefore;
                //this.entityStats(entity).nonValueAddedTime.record(this.simTime - timeStampBefore);
                break;
        
            default:
                break;
        }

    }

recordEntityStats(entity : Entity){
    
    this.entityStats(entity).nonValueAddedTime.record(entity.nonValueAddedTime);
    this.entityStats(entity).waitTime.record(entity.waitTime);
    this.entityStats(entity).transferTime.record(entity.transferTime);
    this.entityStats(entity).valueAddedTime.record(entity.valueAddedTime);
    this.entityStats(entity).otherTime.record(entity.otherTime);
}


entityStats(entity : Entity) : EntityStats{
    return this.statistics.entityStats.get(entity.type);
}


resourceStats(resource : Resource) : ResourceStats{
    return this.statistics.resourceStats.get(resource.type);
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











