

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
    entityModels.forEach(entityModel=>{
        this.simulation.entityModels.set(entityModel.type,entityModel);
        entityModel.creation.quantity = entityModel.creation.quantity || 1;
        if(!entityModel.isResource)  this.simulation.recorder.addEntityStats(entityModel.type);
        this.simulation.setCreationConventions(entityModel);
        if(!Entity.counter.has(entityModel.type)) Entity.counter.set(entityModel.type,{value:1});


        this.scehduleCreationYield(entityModel);
    })
  }

    scehduleCreationYield(entityModel){
         let duration = entityModel.creation.repeatInterval ?  entityModel.creation.repeatInterval  :  this.simulation.addRandomValue(entityModel.creation.dist);
       
         entityModel.creation.quantity = entityModel.creation.quantity || 1;
        let t =entityModel.creation.quantity===1 ?  "create" : "batch";
        let n =entityModel.name ? entityModel.name : entityModel.type+Entity.counter.get(entityModel.type).value;
        let m = entityModel.creation.quantity===1 ? `${n} created`: ` created batch of ${entityModel.type}s  with batchsize ${entityModel.creation.quantity}`
                   
        let simEvent = new SimEvent<any>(this.simulation.simTime,duration,"create",m);

        let g  = function *(eModel,c:Creator){

            //First create instance and attact to SimEvent

            if(entityModel.isResource)
            {
                    
               yield *c.createGeneral(eModel,c,c.createResource);
               
                c.simulation.recorder.recordResourceCreate(entityModel.type,entityModel.creation.quantity);

            }else{
                
               yield *c.createGeneral(eModel,c,c.createEntity);

            }

          
              


        }


        simEvent.generator = g(entityModel,this);

        this.simulation.scheduleEvent(simEvent);

    }


    *createGeneral(eModel,creator:Creator, fact:Function){
          
               


                let modelInstances : any[]  = [];
                for (let i = 0; i < eModel.creation.quantity ; i++) {
                    
                    let model = fact(eModel,creator);
                    if(eModel.creation.currentStation) model.currentStation = eModel.creation.currentStation;
                    modelInstances.push( model);
                }         

                if(!eModel.creation.runOnce)
                {
                    //Create new  SimEvent
                    creator.scehduleCreationYield(eModel);
                           
                }
                else{
                    if(eModel.creation.quantity===1)
                    {   
                          creator.simulation.runtime[eModel.name] = modelInstances[0];
                    }
                       
                }


                if(eModel.creation.quantity>1)
                {
                      if(eModel.creation.createBatch) 
                        yield *eModel.creation.createBatch(modelInstances,creator.simulation);
                }else{

                    if(eModel.creation.createInstance) 
                        yield *eModel.creation.createInstance(modelInstances[0],creator.simulation);
                }


    }


  createEntity(entityModel,creator:Creator) : Entity{
       let entityInstance = new Entity(entityModel);
       Object.assign(entityInstance,entityModel);
        creator.simulation.entities.push(entityInstance);

        creator.addEvents(entityModel,entityInstance,creator);

        creator.simulation.recorder.addEntityStateListeners(entityInstance);
        creator.simulation.recorder.recordEntityCreate(entityInstance);
        entityInstance.timeCreated = creator.simulation.simTime;
        entityInstance.lastStateChangedTime = creator.simulation.simTime;

      return entityInstance;
  }




 createResource(resourceModel,creator:Creator) : Resource{
     let resource = new Resource(resourceModel);  
     Object.assign(resource,resourceModel);
     creator.addEvents(resourceModel,resource,creator);
     creator.simulation.resources.push(resource);
     creator.simulation.resourceBroker.registerResource(resource);
     creator.simulation.recorder.addResourceStateListeners(resource);
     resource.timeCreated = creator.simulation.simTime;
     resource.lastStateChangedTime = creator.simulation.simTime;
     resource.lastScheduledStateChangedTime = creator.simulation.simTime;
     return resource;
  }












  










    addEvents(entityModel,modelInstance,creator:Creator){
          
          
           //Should be SET AFTER the creation of an element
            if(entityModel.plannedEvents)
                entityModel.plannedEvents.forEach(function(plannedEvent) {
                    
                        let duration = creator.simulation.addRandomValue(plannedEvent.dist);
                        creator.schedulePlannedEventYield(plannedEvent,modelInstance,duration,creator);
                    
                    
                });
            
            if(entityModel.randomEvents)
                entityModel.randomEvents.forEach(async randomEvent=>{
                    

     
                        let duration = creator.simulation.addRandomValue(randomEvent.dist);
                        creator.scheduleRandomEventYield(randomEvent,modelInstance,duration,creator);
                


                    // let randomEvent = new RandomEvent(e);
                    // this.model.addRandomEvent(randomEvent);
                   /* randomEvent.logMessage = randomEvent.logMessage || randomEvent.name;
                    if(randomEvent.numberOfRuns)
                    {
                        let next = 0;
                        for (var i = 0; i < randomEvent.numberOfRuns; i++) {
                           
                                next+= creator.simulation.addRandomValue(randomEvent.dist);
                                await creator.simulation.setTimer(next).promise
                                    creator.randomEventOccured(randomEvent,modelInstance);
                                
                        }
                    }
                    else{
                        let startTime = creator.simulation.addRandomValue(randomEvent.dist);
                        await creator.simulation.setTimer(startTime).promise
                                    creator.scheduleRandomEvent(randomEvent,modelInstance);
                        
                    }*/
                     
                    
                    
                    
                });
            
          
      }



schedulePlannedEventYield(plannedEvent,modelInstance,duration,creator:Creator ){
       
                    
        plannedEvent.logMessage = plannedEvent.logMessage || plannedEvent.name; 
        let simEvent = new SimEvent<any>(creator.simulation.simTime,duration,"planned",`${modelInstance.name} ${plannedEvent.message}`  );

        let g  = function *(plannedEvent, modelInstance,creator:Creator){


            let duration = creator.simulation.addRandomValue(plannedEvent.repeatInterval);
            creator.schedulePlannedEventYield(plannedEvent,modelInstance,duration,creator)

            if(plannedEvent.action)
                yield *plannedEvent.action(modelInstance,creator.simulation)
        }


        simEvent.generator = g(plannedEvent,modelInstance,creator);

        creator.simulation.scheduleEvent(simEvent);

    }




scheduleRandomEventYield(randomEvent,modelInstance,duration,creator:Creator ){
       
                    
        randomEvent.logMessage = randomEvent.logMessage || randomEvent.name; 
        let simEvent = new SimEvent<any>(creator.simulation.simTime,duration,"random",`${modelInstance.name} ${randomEvent.message}`  );

        let g  = function *(randomEvent, modelInstance,creator:Creator){


            let duration = creator.simulation.addRandomValue(randomEvent.dist);
            creator.scheduleRandomEventYield(randomEvent,modelInstance,duration,creator)

            if(randomEvent.action)
                yield *randomEvent.action(modelInstance,creator.simulation)
        }


        simEvent.generator = g(randomEvent,modelInstance,creator);

        creator.simulation.scheduleEvent(simEvent);

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
                    if(variableName!=="existing")
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
                      else{
                            if(this.simulation.runtime.variables.kpi===null)
                            {
                                this.simulation.runtime.variables.kpi = {};
                            }

                            variables[variableName].forEach(variable=>{
                                this.simulation.recorder.addExistingVariable(variable);
                                
                                this.simulation.runtime.variables.kpi[variable.name] =0;
                            })

                            
                            delete this.simulation.runtime.variables.existing;
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




































