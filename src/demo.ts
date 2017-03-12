


import {Simulation} from './simulation/simulation'
import {Distributions} from './simulation/stats/distributions'


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
                onCreateModel:async (part,ctx:Simulation)=>{

                    let enqueueResult =await ctx.enqueue(part,ctx.queue("processQueue"));

                    let seizeResult = await ctx.seizeResource(part,ctx.runtime.worker1);

                    let dequeueResult =await ctx.dequeue(part,ctx.queue("processQueue"));

                    await ctx.delay(part,seizeResult.resource,ctx.data.machineProcessTime);                
                
                    ctx.process("processPart").release(part,seizeResult.resource);
                    
                    ctx.dispose(part);
                  


                }            
            }
        },

        {
            type:"worker",
            name:"worker1",
            isResource:true
        },
        
        {
            type:"worker2",
            quantity:10,
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
        await simulation.simulate();
        simulation.report();

}




}

let d = new Demo();
d.simulate();