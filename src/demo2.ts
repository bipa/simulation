


import {Simulation,ExistingVariables} from './simulation/simulation2'
import {Distributions} from './simulation/stats/distributions'
import {Entity} from './simulation/model/entity'


export class Demo{


data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;
logText:string ="";

constructor(){
    this.data.partArrivalDist = {type:Distributions.Exponential, param1:5}
    this.data.machineProcessTime = {type:Distributions.Exponential, param1:3}




    let variables : any                         = {}; //don't remove this line - declaration
    variables.kpi                      = {}; //don't remove this line - declaration
    variables.kpi.queueLength = 0;
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
        stations:[],
        routes:[],
        entities:this.getEntities(),
        preferences:this.getPreferences()

    

    };

}

 
  
 

 getEntities(){
    return [

        {
            type:"part",
            creation:{
                dist:this.data.partArrivalDist,
                createInstance:function *(part : Entity,ctx:Simulation){
                    
                    

                    //let dequeueResult = await ctx.seize(part,[ctx.runtime.worker1],ctx.queue("nursesQueue"));

                    
                     let enqueueResult =  yield ctx.enqueue(part,ctx.queue("nursesQueue"));

                     let seizeResult   = yield ctx.seizeOneFromManyResources(part,[ctx.runtime.worker1]);
                   let i =0;
                   
                     let dequeueResult = yield *ctx.dequeue(part,ctx.queue("nursesQueue"));
                     let k =0;
                     
                     let delayResult   = yield *ctx.delay(part,seizeResult.resource,ctx.data.machineProcessTime);                
                    let j =0;
                 
                
                   let releaseResult = yield *ctx.release(part,seizeResult.resource);
                    
                   let disposeResult = yield  ctx.dispose(part);
                  

                }            
            }
        },

        {
            type:"worker",
            name:"worker1",
            isResource:true
        }


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