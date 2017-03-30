

import {IBase} from '../model/ibase';
import {Entity,EntityStates} from '../model/entity';
import {IEntity} from '../model/ientity';
import {Resource,ResourceStates, InterruptRules} from '../model/resource';
import {Route} from '../model/route';
import {Station} from '../model/station';
import {Process} from '../tasks/process';
import {ISimulation} from '../model/iSimulation';
import {Simulation,SimulationRecord} from '../simulation';
import {SimEvent,ISimEventResult,ISimEvent} from '../simEvent';

import {PriorityQueue} from '../queues/priorityQueue';


import { AbstractQueue } from '../queues/abstractQueue';


import { FifoQueue } from '../queues/fifoQueue';

import {Walk,WalkResult} from '../tasks/walk';
import {Seize,SeizeResult} from '../tasks/seize';
import {Delay,DelayResult} from '../tasks/delay';
import {Enqueue,EnqueueResult} from '../tasks/enqueue';
import {Dequeue,DequeueResult} from '../tasks/dequeue';
import {Release,ReleaseResult} from '../tasks/release';
import {Dispose,DisposeResult} from '../tasks/dispose';

import {Units,Distributions,Distribution} from '../stats/distributions';

var PD = require("probability-distributions");   


export class Tasker{


    simulation:ISimulation;




    constructor(simulation:ISimulation){

        this.simulation = simulation;
      


     }



//Tasks

    walkEvent(entity:IBase,from:Station,to : Station,speed=1): SimEvent<WalkResult>{
        return Walk.walkEvent(this.simulation,entity,from,to,speed);
    }


    *walk(entity:IBase,from:Station,to : Station,speed=1) {
            speed = entity.speed  || speed;
            let route = this.simulation.route(from,to);
            let time  = speed*route.distance/60;
            let timeStampBefore = this.simulation.simTime;
            if(entity instanceof Resource)
            {
                   let resource =  entity as Resource;
                   resource.setState(ResourceStates.transfer);
            }else
            {
                   let e =  entity as Entity;
                   e.setState(EntityStates.transfer);
            }

            this.simulation.currentSimEvent.scheduledAt = this.simulation.simTime;
            this.simulation.currentSimEvent.deliverAt = this.simulation.simTime+time;
            this.simulation.currentSimEvent.type ="walk";
            this.simulation.currentSimEvent.message = `${entity.name} is done walking from ${from.name} to ${to.name}`;
            this.simulation.cleanSimEvent();
            if(entity instanceof Resource)
            {
                let resource = entity as Resource;
                this.simulation.currentSimEvent.resources.push(resource);
            }
            else{
                
                this.simulation.currentSimEvent.entities.push(entity as Entity);
            }
            
            yield;
            entity.currentStation = to;
           /* if(entity instanceof Resource)
            {
                    let resource =  entity as Resource;
                    resource.setState();
            }
            else 
            {
                  //  this.simulation.recorder.recordEntityStat(entity as Entity,timeStampBefore,EntityStates.transfer);
            }*/
            

    }
 
    *walkTo(entity:IBase,to : Station,speed=1) {
       yield *this.walk(entity,entity.currentStation,to,speed);
    }

   


    yesNo(probability : number) : boolean
    {

             let sampleProb = PD.rbinom(1,1,probability);
             return sampleProb[0]==1 ? true : false;
    }


    splitDurationRandomly(duration : Distribution, count: number=2) : Distribution[]
    {
        let dists : Distribution[]  = [];

        let totalDuration = this.simulation.addRandomValue(duration);

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




           let req = this.simulation.resourceBroker.addRequest(this.simulation.currentSimEvent,entity,resources,quantity,priority);


            if(req.isDone)
            {
                return req.seizeResult;
            }

    }





          
  
 
       seizeOnIdle(entity: Entity, resource: Resource,simEvent : ISimEvent){  
                   
            resource.emitter.once("idle", (resource : Resource) => {


                
                     simEvent.type ="seize";
                     simEvent.message = `  ${entity.name} seized ${resource.name}`;
                     simEvent.scheduledAt = this.simulation.simTime;
                     simEvent.deliverAt = this.simulation.simTime;
                     simEvent.currentResult = this.inner_seize(entity,resource); 

                     this.simulation.cleanSimEvent(simEvent); 
                     simEvent.resources.push(resource)    
                     simEvent.entities.push(entity)       
                     this.simulation.simulator.scheduleEvent(simEvent);

             
             
            });
            
        }
   inner_seize(entity: Entity, resource: Resource, 
                           ) :SeizeResult {
                entity.seizeResource(resource);
                return new SeizeResult(entity, resource);
    }





    interruptResource(resource:Resource) : ISimEvent {

            //search for simEvents where this resource INTERSECTS
            //NOTICE WE dont know when the interruption is over
            //Notice, we dont know what is happening afterwards also
            
            if(resource.state===ResourceStates.idle) return null;

            let simTime = this.simulation.simTime;

            let filter = (simEvent:ISimEvent)=> {
                    return simEvent.resources.some(res=>res.name==resource.name) &&
                            simEvent.scheduledAt<=simTime&&simEvent.deliverAt > simTime;
            }

            //Should be at most one
            let simEvents =  this.simulation.simulator._queue.filter(filter)

            this.simulation.simulator._queue.remove(filter);


            
            if(resource.seizedBy)
            {
                //this means that the entities are also "interrupted"
            }



            if(simEvents.length>0)
            {
                let simEvent = simEvents[0];
                return simEvent;
            }else{
                return null;
            }



    }





    interruptEntity(entity:Entity) : ISimEvent {

            //search for simEvents where this resource INTERSECTS
            //NOTICE WE dont know when the interruption is over
            //Notice, we dont know what is happening afterwards also
            
            //if(entity.state===ResourceStates.idle) return null;

            let simTime = this.simulation.simTime;

            let filter = (simEvent:ISimEvent)=> {
                    return simEvent.entities.some(res=>res.name==entity.name) &&
                            simEvent.scheduledAt<=simTime&&simEvent.deliverAt > simTime;
            }

            //Should be at most one
            let simEvents =  this.simulation.simulator._queue.filter(filter)

            this.simulation.simulator._queue.remove(filter);


            


            if(simEvents.length>0)
            {
                let simEvent = simEvents[0];
                return simEvent;
            }else{
                return null;
            }



    }





















    startEventFrom(simEvent:ISimEvent,generator:any){

        

        let newSimEvent = new SimEvent(this.simulation.simTime,simEvent.deliverAt,"start");

        newSimEvent.deliverAt = simEvent.deliverAt;

        newSimEvent.generator = generator();
        this.simulation.scheduleEvent(newSimEvent);

    }






    release(entity:Entity,resource:Resource,resourceState : ResourceStates = ResourceStates.idle, entityState:EntityStates = EntityStates.nonValueAdded) {
          

            this.simulation.currentSimEvent.type ="release";
            this.simulation.currentSimEvent.message = `${entity.name} released ${resource.name}`;
            this.simulation.currentSimEvent.currentResult = new ReleaseResult(entity,resource);
            this.simulation.cleanSimEvent();
            this.simulation.currentSimEvent.resources.push(resource)    
            this.simulation.currentSimEvent.entities.push(entity)  
           
           if(resource.setInactiveOnRelease){
               resource.setState(ResourceStates.inActive);
               resource.setInactiveOnRelease  = false;
           }else{
                resource.setState(resourceState);
           }
           entity.releaseResource(resource);
            entity.setState(entityState)

    }



    delay(entity: Entity, resource: Resource, processTimeDist: Distribution,resourceState : ResourceStates = ResourceStates.busy, entityState:EntityStates = EntityStates.valueAdded){

            if(resource.state===ResourceStates.broken || resource.state===ResourceStates.inActive){
                //Keep on hold
                //Delay has started but during the seize, the resource broke down or had some sort of pasue
                    let processTime = this.simulation.addRandomValue(processTimeDist);
                    let timeStampBefore = this.simulation.simTime;
                    let simEvent = this.simulation.currentSimEvent;
                    simEvent.type ="delay";
                    simEvent.message = `  ${entity.name} processed by ${resource.name}`;
                    simEvent.scheduledAt = this.simulation.simTime;

                    simEvent.onHold = true;
                    this.simulation.resourceBroker.addPauseAndResumeRequest(this.simulation.currentSimEvent,entity,[resource]);
                    



            }
            else{
                    let processTime = this.simulation.addRandomValue(processTimeDist);
                    let timeStampBefore = this.simulation.simTime;
                    this.simulation.currentSimEvent.scheduledAt = this.simulation.simTime;
                    this.simulation.currentSimEvent.deliverAt = this.simulation.simTime+processTime;
                    this.simulation.currentSimEvent.type ="delay";
                    this.simulation.currentSimEvent.message = `  ${entity.name} processed by ${resource.name}`;
                    this.simulation.cleanSimEvent();
                    this.simulation.currentSimEvent.resources.push(resource)    
                    this.simulation.currentSimEvent.entities.push(entity)        
                    resource.setState(resourceState)
                    entity.setState(entityState)
            }

            
            
    }


delayResource( resource: Resource, processTimeDist: Distribution,nextResourceState:ResourceStates = ResourceStates.inActive){
            let processTime = this.simulation.addRandomValue(processTimeDist);
            let timeStampBefore = this.simulation.simTime;
            this.simulation.currentSimEvent.scheduledAt = this.simulation.simTime;
            this.simulation.currentSimEvent.deliverAt = this.simulation.simTime+processTime;
            this.simulation.currentSimEvent.type ="delay";
            this.simulation.currentSimEvent.message = `  ${resource.name} delay is done`;
            this.simulation.cleanSimEvent();
            this.simulation.currentSimEvent.resources.push(resource)     
            resource.setState(nextResourceState);
          
    }

 




    enqueue(entity: Entity,queue :AbstractQueue<IBase>, entityState : EntityStates = EntityStates.wait) {
       

            entity.setState(entityState)
            queue.enqueue(entity);
            if (queue.length == 1) {  
                
                this.simulation.currentSimEvent.type ="front";
                this.simulation.currentSimEvent.message = `  ${entity.name} is now in front of ${queue.name}`;               
                this.simulation.cleanSimEvent(); 
                this.simulation.currentSimEvent.entities.push(entity)    
            }
            else{
                 //Listen for the one time the entity is in front....then seize
                //set this.simulation currentSimEvent on HOLD, we dont know when its scheduled
                let simEvent = this.simulation.currentSimEvent;
                queue.eventEmitter.once(entity.name,  () => {   

                     simEvent.type ="front";
                     simEvent.message = `  ${entity.name} is now in front of ${queue.name}`;
                     simEvent.deliverAt = this.simulation.simTime;
                     simEvent.scheduledAt = this.simulation.simTime;
                     this.simulation.cleanSimEvent(simEvent); 
                     simEvent.entities.push(entity)    
                     this.simulation.simulator.scheduleEvent(simEvent);
                    
            
                });
                this.simulation.currentSimEvent.onHold = true;
             }

           
        

    }

    *dequeue(entity: Entity,queue :AbstractQueue<IEntity>){
        
            this.simulation.currentSimEvent.currentResult = new DequeueResult(entity);   
            this.simulation.currentSimEvent.type ="dequeue";
            this.simulation.currentSimEvent.message = `${entity.name} has dequeued ${queue.name}`;
            this.simulation.cleanSimEvent(); 
            this.simulation.currentSimEvent.entities.push(entity)    
            yield;
            queue.dequeue();
            //this.simulation.recorder.recordEntityStat(entity,entity.lastEnqueuedAt,EntityStates.wait);

           
          
           
           
    }


    dispose(entity:Entity){
    
            this.simulation.currentSimEvent.currentResult = new DisposeResult(entity);   
            this.simulation.currentSimEvent.type ="dispose";
            this.simulation.currentSimEvent.message = `${entity.name} is disposed`;
            this.simulation.cleanSimEvent(); 
            this.simulation.currentSimEvent.entities.push(entity)    
            entity.dispose(this.simulation.simTime);
            this.simulation.recorder.recordEntityDispose(entity);
            this.simulation.removeEntity(entity);
            
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
           t.seizeResource(res as Resource);
            counter++
        })

    }






}




































