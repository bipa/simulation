


import {Simulation,ExistingVariables} from './simulation/simulation'
import {Distributions} from './simulation/stats/distributions'
import {Route} from './simulation/model/route'
import {Station} from './simulation/model/station'
import {Entity} from './simulation/model/entity'
import {Resource,ResourceStates} from './simulation/model/resource'


export class Demo{


data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;
logText:string ="";

constructor(){
    this.data.partArrivalDist = {type:Distributions.Exponential, param1:5};
    this.data.machineProcessTime = {type:Distributions.Exponential, param1:3};
    this.data.machineBrokenTime = {type:Distributions.Exponential, param1:40};
    this.data.machineBrokenDuration = {type:Distributions.Exponential, param1:4};
    this.data.workerLunchTime =     {value:20};
    this.data.workerLunchDuration = { value:5};



    this.data.stations  = {};
    this.data.stations.partStation = new Station("partStation");
    this.data.stations.workerStation = new Station("workerStation");
    this.data.stations.inventory = new Station("inventory");

    this.data.routes=[
        new Route(this.data.stations.partStation,this.data.stations.workerStation,2),
        new Route(this.data.stations.workerStation,this.data.stations.inventory,4),
    ]

    let variables : any                         = {}; //don't remove this line - declaration
    variables.kpi                      = {}; //don't remove this line - declaration
   
    variables.existing = [
        {type:"part",variable:ExistingVariables.entityTotalWaitTimePercentage,name:"partTotalWaitTimePercentage",display:"Part ventetid %"},
        {type:"part",variable:ExistingVariables.entityTotalValueAddedTimePercentage,name:"partTotalValueAddedTimePercentage",display:"Part VA tid %"},
        {type:"part",variable:ExistingVariables.entityTotalTransferTimePercentage,name:"partTotalTransferTimePercentage",display:"Part transfer tid %"},
        {type:"worker",variable:ExistingVariables.resourceTotalBusyTimePercentage,name:"workerTotalBusyTimePercentage",display:"Worker busy %"},
        {type:"worker",variable:ExistingVariables.resourceTotalIdleTimePercentage,name:"workerTotalIdleTimePercentage",display:"Worker idle %"},
        {type:"worker",variable:ExistingVariables.resourceTotalTransferTimePercentage,name:"partTotalTransferTimePercentage",display:"Worker transfer %"},
    
    
    ]

    this.model = {
        data:this.data,
        variables:variables,
        stations:this.getFromData(this.data.stations),
        routes:this.getFromData(this.data.routes),
        entities:this.getEntities(),
        preferences:this.getPreferences(),
        charts:this.getCharts()

    

    };

}

 
  
 getFromData<T>(obj : any) : T[]
 {  
     let a : T[] = [];

    for(let o in obj){
        let value = obj[o];
        a.push(value);
    }

    return a;
 }
 
 

 getEntities(){
    return [

        {
            type:"part",
            creation:{
                dist:this.data.partArrivalDist,
                currentStation : this.data.stations.partStation,
                createInstance:function *(part : Entity,ctx:Simulation){
                    
                     yield  ctx.tasks.enqueue(part,ctx.queue("nursesQueue"));

 let seizeResult   = yield  ctx.tasks.seizeOneFromManyResources(part,[ctx.runtime.worker1]);
                            ctx.runtime.worker1.setState(ResourceStates.wait);
                     yield *ctx.tasks.dequeue(part,ctx.queue("nursesQueue"));

                     yield *ctx.tasks.walkTo(part,seizeResult.resource.currentStation);
                     yield  ctx.tasks.delay(part,seizeResult.resource,ctx.data.machineProcessTime);                
                
                     yield  ctx.tasks.release(part,seizeResult.resource);
                    
                     yield *ctx.tasks.walkTo(part,ctx.data.stations.inventory);

                     yield  ctx.tasks.dispose(part);
                  

                }            
            }
        },

        {
            type:"worker",
            name:"worker1",
            isResource:true,
            creation:{
                currentStation : this.data.stations.workerStation
            },
            plannedEvents:[
                  {
                    name:"lunch",
                    message:"is going to lunch",
                    dist:this.data.workerLunchTime,
                    repeatInterval:this.data.workerLunchTime,
                    action: function *(worker : Resource,ctx:Simulation){
                        
                           let simEvent =  ctx.tasks.interruptResource(worker);
                           let timeStamp = ctx.simTime;
                           worker.setInactiveOnRelease = true;
                           if(simEvent)
                           {   
                               ctx.simulator.scheduleEvent(simEvent);
                               ctx.tasks.startEventFrom(simEvent,function *(){

                                    //The resource goes to lunch and is set to inactive (default)
                                    yield ctx.tasks.delayResource(worker,ctx.data.workerLunchDuration)
                                    //the resource becomes idle
                                    //worker.nextState = ResourceStates.idle;
                                    worker.setState(ResourceStates.idle);
                               })
                            }

                    }
                }


            ],
            randomEvents:[
                  {
                    name:"acute",
                    message:"is broken",
                    dist:this.data.machineBrokenTime,
                    action: function *(worker : Resource,ctx:Simulation){
                        

                        

                           let simEvent =  ctx.tasks.interruptResource(worker);
                           worker.setState(ResourceStates.broken);
                           if(simEvent)
                           {   
                                    //The resource goes to lunch
                                
                                    let workLeft  = simEvent.deliverAt - ctx.simTime;
                                    //The resource goes to lunch and is set to inactive (default)                          
                                    yield ctx.tasks.delayResource(worker,ctx.data.machineBrokenDuration,ResourceStates.broken)
                                    //the resource becomes idle
                                    //worker.nextState = ResourceStates.idle;
                                    //Continue with the task that was interrupted
                                    worker.setState(ResourceStates.busy);
                                    simEvent.deliverAt = ctx.simTime+workLeft;
                                    //Continue with the task
                                    ctx.simulator.scheduleEvent(simEvent);
                            }
                            else{
                                       yield ctx.tasks.delayResource(worker,ctx.data.machineBrokenDuration,ResourceStates.broken)
                                       worker.setState(ResourceStates.idle);
                            }

                    }
                }


            ]
            
        }


    ];
}





getCharts(){
    return [
            { variable:"workerTotalBusyTimePercentage"},
            { variable:"workerTotalIdleTimePercentage"},
            { variable:"partTotalTransferTimePercentage"}
];
}



getPreferences() {

    return {
        seed:1234,
        simTime:200,
        useLogging:true,
        //logger:this.logger
    }



}

logger =(message:string)=>{
    this.logText+=message;
}

  async simulate() {
        let simulation = new Simulation(this.model);
        let simRes = await simulation.simulate();
        simulation.report();

}




}

let d = new Demo();
d.simulate();