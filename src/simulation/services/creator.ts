

import {Entity} from '../model/entity';
import {Resource} from '../model/resource';
import {Route} from '../model/route';
import {Station} from '../model/station';
import {Process} from '../tasks/process';
import {ISimulation} from '../model/iSimulation';
import {SimulationRecord} from '../simulation';
import {SimEvent,ISimEventResult} from '../simEvent';















export class Creator{


    simulation:ISimulation;

    constructor(simulation:ISimulation){

        this.simulation = simulation;
    }


 

//ROUTES

    createRoutes(routeModels : any[]){
        routeModels.forEach(routeModel=>{
            let fromStation = this.station(routeModel.from);
            let toStation = this.station(routeModel.to);

            let route =routeModel instanceof Route ? routeModel: new Route(fromStation,toStation,routeModel.distance,routeModel.twoway);
         
            Object.assign(route,routeModel);
            this.simulation.routes.push(route);
            if(route.twoWay){
                let oppRoute = new Route(toStation,fromStation,routeModel.distance); 
                Object.assign(oppRoute,routeModel);
                this.simulation.routes.push(route);
            }
        })
    }

    route(from:Station,to:Station) : Route{
       let r = this.simulation.routes.find(r=>{
            return r.from===from && r.to===to;
        })

        return r;
    }


//STATIONS




    station(name:string) : Station{
        let station =  this.simulation.stations.find(s=>{return s.name === name});
        return station;
    }

//ENTITIES




  createEntities(entityModels:any[]){
    entityModels.filter(entityModel=>{return !entityModel.isResource}).forEach(entityModel=>{
        this.simulation.entityModels.set(entityModel.type,entityModel);
        entityModel.creation.quantity = entityModel.creation.quantity || 1;
        this.simulation.recorder.addEntityStats(entityModel.type);
        this.simulation.setConventions(entityModel);
        if(!Entity.counter.has(entityModel.type)) Entity.counter.set(entityModel.type,{value:1});


        this.scehduleCreationYield(entityModel);

      //this.scheduleCreation2(entityModel);

     // this.scheduleNextCreation(entityModel);
    })
  }

    scehduleCreationYield(entityModel){
         let createAt = entityModel.creation.repeatInterval ?  entityModel.creation.repeatInterval  :  this.simulation.addRandomValue(entityModel.creation.dist);
       
         entityModel.creation.quantity = entityModel.creation.quantity || 1;
        let t =entityModel.creation.quantity===1 ?  "create" : "batch";
        let n =entityModel.name ? entityModel.name : entityModel.type+Entity.counter.get(entityModel.type).value;
        let m = entityModel.creation.quantity===1 ? `${n} created`: ` created batch of ${entityModel.type}s  with batchsize ${entityModel.creation.quantity}`
                   
        let simEvent = new SimEvent<any>(this.simulation.simTime,createAt,"create",m);

        let g  = function *(eModel,c:Creator){

            //First create instance and attact to SimEvent

            if(entityModel.isResource)
            {

            }else{
                
               yield *c.createGeneral(eModel,c,c.createEntity,c.simulation.entities);

            }

          
              


        }


        simEvent.generator = g(entityModel,this);

        this.simulation.scheduleEvent(simEvent);

    }


    *createGeneral(eModel,creator:Creator, fact:Function, array:any[]){
          
               


                let modelInstances : any[]  = [];
                for (let i = 0; i < eModel.creation.quantity ; i++) {
                    
                        modelInstances.push( this.createEntity(eModel));
                }         
                modelInstances.forEach(e=>{this.simulation.entities.push(e)})

                if(!eModel.creation.once)
                {
                    //Create new  SimEvent
                    creator.scehduleCreationYield(eModel);
                }


                if(eModel.creation.quantity>1)
                {
                      if(eModel.creation.createBatch) 
                        yield *eModel.creation.createBatch(modelInstances,this.simulation);
                }else{

                    if(eModel.creation.createInstance) 
                        yield *eModel.creation.createInstance(modelInstances[0],this.simulation);
                }


    }


  createEntity(entityModel) : Entity{
       let entityInstance = new Entity(entityModel);
       Object.assign(entityInstance,entityModel);
        this.addEvents(entityModel,entityInstance);
        this.simulation.recorder.recordEntityCreate(entityInstance);
        entityInstance.timeEntered = this.simulation.simTime;

        //HER LAGES DET NYE EVENTER---
        if(entityModel.creation.createInstance) 
            entityModel.creation.createInstance(entityInstance,this.simulation);
      return entityInstance;
  }































 async scheduleNextCreation2(entityModel:any){

          let createAt = this.simulation.addRandomValue(entityModel.creation.dist);
                entityModel.creation.quantity = entityModel.creation.quantity || 1;
                    let t =entityModel.creation.quantity===1 ?  "create" : "batch";
                    let n =entityModel.name ? entityModel.name : entityModel.type+Entity.counter.get(entityModel.type).value;
                    let m = entityModel.creation.quantity===1 ? `${n} created`: ` created batch of ${entityModel.type}s  with batchsize ${entityModel.creation.quantity}`
                   
                    this.simulation.setTimer(createAt,t,m).promise.then((simEvent)=>{
                        this.createModel(entityModel);
                        
                        

                    })
 }





 async scheduleNextCreation(entityModel:any){

          let createAt = this.simulation.addRandomValue(entityModel.creation.dist);
                entityModel.creation.quantity = entityModel.creation.quantity || 1;
                    let t =entityModel.creation.quantity===1 ?  "create" : "batch";
                    let n =entityModel.name ? entityModel.name : entityModel.type+Entity.counter.get(entityModel.type).value;
                    let m = entityModel.creation.quantity===1 ? `${n} created`: ` created batch of ${entityModel.type}s  with batchsize ${entityModel.creation.quantity}`
                   
                    this.simulation.setTimer(createAt,t,m).promise.then((simEvent)=>{
                        this.createModel(entityModel);
                        
                        

                    })
 }
























scheduleCreations(entityModel:any){
    let simTime =0;
    let creation = entityModel.creation;
    let nextCreateTime = creation.runAtZero ? 0 :this.simulation.addRandomValue(entityModel.creation.dist);
   
    this.scheduleCreation(simTime,nextCreateTime,entityModel);
    

    if(creation.runOnce) return;
     
    if(creation.repeatInterval || creation.dist) {


        while(nextCreateTime<= this.simulation.endTime){
            simTime = nextCreateTime;
            nextCreateTime += creation.repeatInterval ?  this.simulation.addRandomValue(creation.repeatInterval)  :  this.simulation.addRandomValue(creation.dist);
            this.scheduleCreation(simTime,nextCreateTime,entityModel);
        }

    }

   
  

}

async scheduleCreation2(entityModel:any)
{ 
        let t =entityModel.creation.quantity===1 ?  "create" : "batch";
        let n =entityModel.name ? entityModel.name : entityModel.type+Entity.counter.get(entityModel.type).value;
        let m = entityModel.creation.quantity===1 ? `${n} created`: ` created batch of ${entityModel.type}s  with batchsize ${entityModel.creation.quantity}`
                         
        let nextCreateTime = entityModel.creation.repeatInterval ?  entityModel.creation.repeatInterval  :  this.simulation.addRandomValue(entityModel.creation.dist);
           
        let simEvent = new SimEvent<CreateEntityResult>(this.simulation.simTime,this.simulation.simTime+nextCreateTime,t,m);
        this.simulation.scheduleEvent2(simEvent,false);
        await simEvent.promise;
        this.createEntityInstance(entityModel)
        if(!entityModel.creation.once)
        {
            this.scheduleCreation2(entityModel);
        }
      /*  if(entityModel.creation.createBatch || entityModel.creation.createInstance) 
            return;
        else{
            this.simulation.nextStep2();  
        }  */
}

async scheduleCreation(simTime:number,nextCreateTime:number,entityModel:any)
{ 
        let t =entityModel.creation.quantity===1 ?  "create" : "batch";
        let n =entityModel.name ? entityModel.name : entityModel.type+Entity.counter.get(entityModel.type).value;
        let m = entityModel.creation.quantity===1 ? `${n} created`: ` created batch of ${entityModel.type}s  with batchsize ${entityModel.creation.quantity}`
                         

        let simEvent = new SimEvent<CreateEntityResult>(simTime,nextCreateTime,t,m);
        this.simulation.scheduleEvent2(simEvent,false);
        await simEvent.promise;
            this.createEntityInstance(entityModel)
           // this.simulation.nextStep();    
}



 createModel(entityModel){
          
          this.createEntityInstance(entityModel);
          
            if(!entityModel.creation.runOnce)
            {
                if(entityModel.creation.repeatInterval){
                    
                    let repeatInterval = this.simulation.addRandomValue(entityModel.creation.repeatInterval);
                    let t =entityModel.creation.quantity===1 ?  "create" : "batch";
                    let n =entityModel.name ? entityModel.name : entityModel.type+Entity.counter.get(entityModel.type).value;
                    let m = entityModel.creation.quantity===1 ? `${n} created`: ` created batch of ${entityModel.type}s  with batchsize ${entityModel.creation.quantity}`
                   
                    this.simulation.setTimer(repeatInterval,t,m).promise.then((simEvent)=>{
                    this.createModel(entityModel);
                        

                    })
                    
                }
                else{
                    this.scheduleNextCreation(entityModel);
                }
            }
            else{
                //Send beskjed om at denne EVENTEN er DONE og at vi kan gå VIDERE...
            }
            
      }

 createSingleItem2(entityModel) : Entity{
                 let entityInstance = new Entity(entityModel);
                 Object.assign(entityInstance,entityModel);
                  this.addEvents(entityModel,entityInstance);
                  this.simulation.recorder.recordEntityCreate(entityInstance);
                  entityInstance.timeEntered = this.simulation.simTime;

                  //HER LAGES DET NYE EVENTER---
                  //if(entityModel.creation.createInstance) entityModel.creation.createInstance(entityInstance,this.simulation);
                return entityInstance;
            }



    createEntityInstance(entityModel){
                let modelInstances : Entity[]  = [];
                for (let i = 0; i < entityModel.creation.quantity ; i++) {
                    
                        modelInstances.push( this.createEntity(entityModel));
                }         
                modelInstances.forEach(e=>{this.simulation.entities.push(e)})
                if(entityModel.creation.quantity>1 && entityModel.creation.createBatch)
                {
                    entityModel.creation.createBatch(modelInstances,this.simulation);
                }
               
        }


  










    addEvents(entityModel,modelInstance){
          
          
           //Should be SET AFTER the creation of an element
            if(entityModel.plannedEvents)
                entityModel.plannedEvents.forEach(async  plannedEvent=>{
                    
                    // let plannedEvent = new PlannedEvent(e);
                    // this.model.addPlannedEvent(plannedEvent);
                    plannedEvent.logMessage = plannedEvent.logMessage || plannedEvent.name;
                    let startTime = this.simulation.addRandomValue(plannedEvent.dist);
                    await this.simulation.setTimer(startTime).promise
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
                           
                                next+= this.simulation.addRandomValue(randomEvent.dist);
                                await this.simulation.setTimer(next).promise
                                    this.randomEventOccured(randomEvent,modelInstance);
                                
                        }
                    }
                    else{
                        let startTime = this.simulation.addRandomValue(randomEvent.dist);
                        await this.simulation.setTimer(startTime).promise
                                    this.scheduleRandomEvent(randomEvent,modelInstance);
                        
                    }
                     
                    
                    
                    
                });
            
          
      }
      
   async schedulePlannedEvent(plannedEvent,modelInstance){
            
            
            //Schedule the next plannedEvent
            let repeatInterval = this.simulation.addRandomValue(plannedEvent.repeatInterval);
            
            await this.simulation.setTimer(repeatInterval).promise
                
                 this.schedulePlannedEvent(plannedEvent,modelInstance);
                //Log the execution of the planned event
                if(plannedEvent.logEvent) this.simulation.log(plannedEvent.logMessage);
                //Execute the planned event
                plannedEvent.action(modelInstance,this.simulation);
           
            
            
            
            
        }
        
       async scheduleRandomEvent(randomEvent,modelInstance){
            
            //Schedule the next plannedEvent
            let nextEventAt = this.simulation.addRandomValue(randomEvent.dist);
            this.randomEventOccured(randomEvent,modelInstance);
         
           await this.simulation.setTimer(nextEventAt).promise;
                    this.scheduleRandomEvent(randomEvent,modelInstance);
             
            
            
        }
        
        randomEventOccured(randomEvent,modelInstance){
            
            if(randomEvent.logEvent) this.simulation.log(randomEvent.logMessage);
            randomEvent.action(modelInstance,this.simulation);
        }



//RESOURCES



    createResources(resourceModels: any[]){
        resourceModels.filter(entityModel=>{return entityModel.isResource}).forEach(resourceModel=>{

                let instanceCount = resourceModel.quantity || 1;
                for(let i =0;i<instanceCount;i++){
                        let resource = new Resource(resourceModel);  
                        Object.assign(resource,resourceModel);
                        this.simulation.resources.push(resource);
                        if(instanceCount===1){
                            this.simulation.runtime[resource.name] = resource;
                        };
                        this.simulation.recorder.addResourceStateListeners(resource);

                }

                this.simulation.recorder.recordResourceCreate(resourceModel.type,instanceCount);
            
                
                
        });
    }


    resource(name : string) : Resource{
        let r = this.simulation.resources.find(r=>{return r.name === name});
        return r;
    }


//PROCESSES



    createProcesses(processModels:any[]){
    processModels.forEach(processModel=>{
        let process = new Process(this.simulation,processModel);
        Object.assign(process,processModel);
        this.simulation.runtime[processModel.name] = process;
        this.simulation.processes.set(process.name,process);
    });
    }



    process(name:string) : Process{
    
        let process =  this.simulation.processes.get(name);
        if(process)
            return process;
        else
        {
            process =  new Process(this.simulation,name);
            this.simulation.processes.set(process.name,process);
            return process;
        }
            
    }

 



//VARIABLES


    createVariables(variables, ctx){
        for(let variableName in variables) 
        {
            if(Object.keys(variables[variableName]).length>0)
            {

                this.simulation.variables[variableName] = {};

                    for(let subVariableName in variables[variableName]) 
                    {
                        if(variableName=="noLog")
                        {
                                this.simulation.variables[variableName][subVariableName]=
                                variables[variableName][subVariableName];
                        }
                        else{
                            this.createVariable(this.simulation.variables[variableName],
                            subVariableName,
                            variables[variableName][subVariableName],ctx)
                        }

                    }
            }else{
                    this.createVariable(this.simulation.variables,
                    variableName,
                    variables[variableName],ctx)
            }

        
        }
    }


    createVariable(obj,propName, initValue,ctx){
        let vValue=initValue;
        Object.defineProperty(obj,propName,{
                get: function() { return vValue; },
                set: function(value) {
                    vValue = value;
                    ctx.simulationRecords.push(
                        new SimulationRecord( ctx.simTime, propName,value)
                    )}
                }
        )
    }






}

class CreateEntityResult implements ISimEventResult{

        entity:Entity;


        constructor(entity:Entity){
            this.entity = entity;
        }

}




































