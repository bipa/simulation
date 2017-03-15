

import {Entity} from '../model/entity';
import {Resource} from '../model/resource';
import {Route} from '../model/route';
import {Station} from '../model/station';
import {Process} from '../tasks/process';
import {Simulation,SimulationRecord} from '../simulation';
import {SimEvent} from '../simEvent';


export class Creator{


    simulation:Simulation;

    constructor(simulation:Simulation){

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
        this.simulation.recorder.addEntityStats(entityModel.type);
      this.simulation.setConventions(entityModel);
      if(!Entity.counter.has(entityModel.type)) Entity.counter.set(entityModel.type,{value:1});
      this.scheduleNextCreation(entityModel);
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


addCreateEvents(entityModel:any){

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
            
      }




    createEntityInstance(entityModel){
                let modelInstances : Entity[]  = [];
                for (let i = 0; i < entityModel.creation.quantity ; i++) {
                    
                        modelInstances.push( this.createSingleItem(entityModel));
                }         
                modelInstances.forEach(e=>{this.simulation.entities.push(e)})
                if(entityModel.creation.quantity>1 && entityModel.creation.createBatch)
                {
                    entityModel.creation.createBatch(modelInstances,this.simulation);
                }
               
        }


    createSingleItem(entityModel) : Entity{
                 let entityInstance = new Entity(entityModel);
                 Object.assign(entityInstance,entityModel);
                  this.addEvents(entityModel,entityInstance);
                  this.simulation.recorder.recordEntityCreate(entityInstance);
                  entityInstance.timeEntered = this.simulation.simTime;
                  if(entityModel.creation.createInstance) entityModel.creation.createInstance(entityInstance,this.simulation);
                return entityInstance;
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






































