

var fs = require('fs');
const util = require('util')
require('ts-node').register({ 
    
fast:true,
project:""
//,compilerOptions:"target:'es6'"

 })



const code  =

`import {Simulation} from './simulation/simulation'
import {Distributions} from './simulation/stats/distributions'


export class Demo{



data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;

constructor(){
    this.data.partArrivalDist = {type:Distributions.Exponential, param1:5}
    this.data.machineProcessTime = {type:Distributions.Exponential, param1:3}




    let variables : any                         = {}; //don't remove this line - declaration
    variables.kpi                      = {}; //don't remove this line - declaration
    variables.kpi.queueLength = 0;

    this.model = {
        data:this.data,
        variables:variables,
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

                    

                    let simEvent = await ctx.process("processPart").seize(part,ctx.runtime.worker1);

                    await ctx.process("processPart").delay(part,simEvent.result.resource,ctx.data.machineProcessTime);                
                
                    ctx.process("processPart").release(part,simEvent.result.resource);
                    
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
        simTime:20000,
        useLogging:true
    }



}


async  simulate(){
    
    let simulation = new Simulation(this.model);
    await simulation.simulate();
    simulation.report();
    

}




}`




/*fs.writeFile("server/test.ts", code, function(err) {
    if(err) {
        return console.log(err);
    }

     console.log("The file was saved!");

    let Demo = require('./test.ts');

    console.log(Demo.toString());


    console.log(util.inspect(Demo, false, null))
    let d = new Demo.Demo();
    d.simulate(); 

});*/ 




 

 let Demo = require('./test.ts');

 console.log(Demo.toString());


console.log(util.inspect(Demo, false, null))
let d = new Demo.Demo();
d.simulate();