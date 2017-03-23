

import {Entity,Allocations} from '../model/entity';
import {IEntity} from '../model/ientity';
import {Resource} from '../model/resource';
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

    walkEvent(entity:Entity,from:Station,to : Station,speed=1): SimEvent<WalkResult>{
        return Walk.walkEvent(this.simulation,entity,from,to,speed);
    }


    *walk(entity:Entity,from:Station,to : Station,speed=1) {
            speed = entity.speed  || speed;
            let route = this.simulation.route(from,to);
            let time  = speed*route.distance;
            let timeStampBefore = this.simulation.simTime;
            if(entity instanceof Resource)
            {
                   let resource =  entity as Resource;
                   resource.transfer();
            }

            this.simulation.currentSimEvent.deliverAt = this.simulation.simTime+time;
            this.simulation.currentSimEvent.type ="walk";
            this.simulation.currentSimEvent.message = `${entity.name} is done walking from ${from.name} to ${to.name}`;
            yield;
            entity.currentStation = to;
            if(entity instanceof Resource)
            {
                    let resource =  entity as Resource;
                    resource.activateNextState();
            }
            else
            {
                    this.simulation.recorder.recordEntityStat(entity,timeStampBefore,Allocations.transfer);
            }
           

    }
 
    *walkTo(entity:Entity,to : Station,speed=1) {
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
                     simEvent.deliverAt = this.simulation.simTime;
                     simEvent.currentResult = this.inner_seize(entity,resource);
                     this.simulation.simulator.scheduleEvent(simEvent);

             
             
            });
            
        }
   inner_seize(entity: Entity, resource: Resource, 
                           ) :SeizeResult {
                resource.seize(entity);
                return new SeizeResult(entity, resource);
    }









































    seizeResource(entity:Entity,resource:Resource) : Promise<SeizeResult>{

        //Creates a new wueue each time
            return Seize.seize(this.simulation,entity,[resource],1);


    }

    release(entity:Entity,resource:Resource) {
          

            this.simulation.currentSimEvent.type ="release";
            this.simulation.currentSimEvent.message = `${entity.name} released ${resource.name}`;
            this.simulation.currentSimEvent.currentResult = new ReleaseResult(entity,resource);
            //yield;
            resource.idle();

    }


    *delay(entity: Entity, resource: Resource, processTimeDist: Distribution,allocation:Allocations = Allocations.valueAdded){
            let processTime = this.simulation.addRandomValue(processTimeDist);
            let timeStampBefore = this.simulation.simTime;
            this.simulation.currentSimEvent.deliverAt = this.simulation.simTime+processTime;
            this.simulation.currentSimEvent.type ="delay";
            this.simulation.currentSimEvent.message = `  ${entity.name} processed by ${resource.name}`;
                     
            resource.process(entity);
            yield;       
            this.simulation.recorder.recordEntityStat(entity,timeStampBefore,allocation);
    }


    enqueue(entity: Entity,queue :AbstractQueue<IEntity>) {
       
      /*  let simEvent = new SimEvent<EnqueueResult>(this.simulation.simTime,this.simulation.simTime,"front",`  ${entity.name} is now in front of ${queue.name}`);
            
            simEvent.result = new EnqueueResult(entity);
*/


            queue.enqueue(entity);
            if (queue.length == 1) {  
                
                this.simulation.currentSimEvent.type ="front";
                this.simulation.currentSimEvent.message = `  ${entity.name} is now in front of ${queue.name}`;
                
            }
            else{
                 //Listen for the one time the entity is in front....then seize
                //set this.simulation currentSimEvent on HOLD, we dont know when its scheduled
                let simEvent = this.simulation.currentSimEvent;
                queue.eventEmitter.once(entity.name,  () => {   

                     simEvent.type ="front";
                     simEvent.message = `  ${entity.name} is now in front of ${queue.name}`;
                     simEvent.deliverAt = this.simulation.simTime;
                     this.simulation.simulator.scheduleEvent(simEvent);
                    
            
                });
                this.simulation.currentSimEvent.onHold = true;
             }

           
        

    }

    *dequeue(entity: Entity,queue :AbstractQueue<IEntity>){
        
            this.simulation.currentSimEvent.currentResult = new DequeueResult(entity);   
            this.simulation.currentSimEvent.type ="dequeue";
            this.simulation.currentSimEvent.message = `${entity.name} has dequeued ${queue.name}`;
            yield;
            queue.dequeue();
            this.simulation.recorder.recordEntityStat(entity,entity.lastEnqueuedAt,Allocations.wait);

           
          
           
           
    }


    dispose(entity:Entity){
    
            this.simulation.currentSimEvent.currentResult = new DisposeResult(entity);   
            this.simulation.currentSimEvent.type ="dispose";
            this.simulation.currentSimEvent.message = `${entity.name} is disposed`;
           
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
                (res as Resource).seize(t);
            counter++
        })

    }






}




































