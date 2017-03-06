


import {Simulation} from './simulation.1'
import {Distributions} from './stats/distributions'





let data  :any                        = {}; //don't remove this line
let constants  :any                        = {}; //don't remove this line


data.partArrivalDist = {type:Distributions.Exponential, param1:5}
data.machineProcessTime = {type:Distributions.Exponential, param1:3}




let variables : any                         = {}; //don't remove this line - declaration
variables.kpi                      = {}; //don't remove this line - declaration
variables.kpi.queueLength = 0;

let model = {
    data:data,
    variables:variables,
    processes:getProcesses(),
    resources:getResources(),
    entities:getEntities(),
    preferences:getPreferences()



};

 




function getEntities(){
    return [

        {
            type:"part",
            name:"part",
            creation:{
                dist:data.partArrivalDist,
                onCreateModel:async (part,ctx:Simulation)=>{

                    

                    let simEvent = await ctx.runtime.processPart.seize(part,ctx.runtime.machine);

                    await ctx.runtime.processPart.delay(part,simEvent.result.resource,ctx.data.machineProcessTime);                
                
                    ctx.runtime.processPart.release(part,simEvent.result.resource);
                    
                    ctx.dispose(part);
                  


                }            
            }
        }


    ];
}


function getProcesses(){
    return[
        {
            name:"processPart",
        }
    ]
}


function getResources(){
    return [

        {
            type:"machine",
            name:"machine1",
            quantity:1, 
        }

    ]
}





function getPreferences() {

    return {
        seed:1234,
        simTime:20000,
        useLogging:false
    }



}


async function simulate(){
    
    let simulation = new Simulation(model);
    await simulation.simulate();
    let i =0;

}


simulate();