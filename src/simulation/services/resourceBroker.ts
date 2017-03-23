

import {Entity} from '../model/entity';
import {Resource,ResourceStates,ScheduledStates} from '../model/resource';
import {Route} from '../model/route';
import {Station} from '../model/station';
import {Process} from '../tasks/process';
import {SeizeResult} from '../tasks/seize';
import {ISimulation} from '../model/iSimulation';
import {Simulation,SimulationRecord} from '../simulation';
import {SimEvent,ISimEventResult,ISimEvent} from '../simEvent';

import {PriorityQueue} from '../queues/priorityQueue';

export class ResourceRequest{


    resources:Resource[];
    entity:Entity;
    priority:number;
    quantity:number;
    simEvent:ISimEvent;
    seizeResult:SeizeResult;
    isDone:boolean = false;

    constructor(simEvent:ISimEvent,entity: Entity,resources:Resource[],quantity:number,priority:number=0){
        
            this.simEvent = simEvent;
            this.entity = entity;
            this.resources = resources;
            this.quantity = quantity;
            this.priority = priority;

            this.seizeResult = new SeizeResult(entity);


    }
}


export class ResourceBroker{


    simulation:ISimulation;

    requests:ResourceRequest[];

    resources:Resource[];

    constructor(simulation:ISimulation){

        this.simulation = simulation;
        this.requests = [];
    
        this.resources = simulation.resources;

     }




     registerResource(resource:Resource){


        

        resource.emitter.on("idle",r=>{

            //check if there are any requests that want this resource
            let request : ResourceRequest;

          let requests =   this.requests.filter(req=>{

               return req.resources.some(res=>{
                    return r.name===res.name;
                })

            })

            if(requests.length>0)
            {

                //Just pick the first element....here there should be som
                //selection criteria

                let request = requests[0];
                this.seizeResource(request,r);
                    if(request.isDone)
                    {
                        this.scheduleSeizeEvent(request);
                    }
            }



        });
     }

idleResources(request : ResourceRequest,resources : Resource[] = null) : Resource[]{

    if(resources){
        return resources.filter(r=>{
            
            return r.scheduledState===ScheduledStates.scheduled && 
                                r.state === ResourceStates.idle
                                        
                                    
           });
    }
    else{
        return this.idleResources(request,this.resources);
    }

}

trySeize(request : ResourceRequest) : boolean{
    


    let idleResources  = this.idleResources(request,request.resources);

    if(idleResources && idleResources.length>0){
      
            idleResources.forEach(r=>{

                    if(request.isDone){
                    }
                    else{
                        this.seizeResource(request,r);
                      
                    }
            });

    }


    return request.isDone;
    
}


seizeResource(request : ResourceRequest,resource:Resource){

    if(request.quantity>1){
            request.seizeResult.resources.push(resource);
            resource.seize(request.entity);
            if(request.seizeResult.resources.length===request.quantity){
                
                request.isDone = true;
            }
    }else{
        request.seizeResult.resource = resource;
        resource.seize(request.entity);
        request.isDone = true;
    }
        
}




addRequest(simEvent:ISimEvent,entity: Entity,resources:Resource[],quantity:number,priority:number=0) {


     let req = new ResourceRequest(simEvent,entity,resources,quantity,priority);


     if(!this.trySeize(req)){
         
            req.simEvent.onHold = true;
            this.requests.push(req);         
         
     }
     else{
         
         //Request succeeded

        this.scheduleSeizeEvent(req);
         
     };

     return req;
}

scheduleSeizeEvent(request : ResourceRequest){

    let index = this.requests.indexOf(request);
    if(index>=0){
        this.requests.splice(index,1);
    }
     request.simEvent.type ="seize";
     request.simEvent.currentResult = request.seizeResult;
     if(request.quantity===1)
     {
        request.simEvent.message = `  ${request.entity.name} seized ${request.seizeResult.resource.name}`;
     }
     else{
        request.simEvent.message = `  ${request.entity.name} seized ${request.quantity} resources`;
     
     }
     request.simEvent.deliverAt = this.simulation.simTime;
     if(request.simEvent.onHold){

           this.simulation.scheduleEvent(request.simEvent);
     }
     //this.simulation.simulator.scheduleEvent(request.simEvent);
}
















}

















