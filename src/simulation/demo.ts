


import {Simulation} from './simulation'
import {Distributions} from './stats/distributions'





let data  :any                        = {}; //don't remove this line
let constants  :any                        = {}; //don't remove this line


data.partArrivalDist = {type:Distributions.Exponential, param1:5}
data.machineProcessTime = {type:Distributions.Triangular, param1:3,param2:5,param3:7.5}

let model = {
    data:data,
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
                onCreateModel:(part,ctx:Simulation)=>{

                    
                let simEvent =  ctx.runtime.processPart.seize(part,ctx.runtime.machine).done(()=>{
                      ctx.runtime.processPart.process(part,simEvent.result.resource,ctx.data.machineProcessTime).done(()=>{
                         ctx.runtime.processPart.release(part,simEvent.result.resource)
                         ctx.dispose(part);
                  
                  });
                  
                });
                
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
        seed:1234
    }



}


let simulation = new Simulation(model);
simulation.simulate(1000);