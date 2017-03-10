


var Chance = require('chance');
var fs = require('fs');
const util = require('util');

require('ts-node').register({ fast:true,project:"" });

const code  =

`import {Simulation} from './simulation/simulation'
import {Distributions} from './simulation/stats/distributions'


export class Demo{



data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;
variables:any = {};

constructor(){
    this.data.partArrivalDist = {type:Distributions.Exponential, param1:5}
    this.data.machineProcessTime = {type:Distributions.Exponential, param1:3}




    let variables : any                         = {}; //don't remove this line - declaration
    variables.kpi                      = {}; //don't remove this line - declaration
    variables.kpi.queueLength = 0;

    this.model = {
        data:this.data,
        variables:this.variables,
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
        useLogging:true,
        logger:this.logger
    }



}


logger =(message:string)=>{
    this.logText+=message;
}

  simulate() : Promise<string>{
   return new Promise<string>(async (resolve,reject)=>{
        let simulation = new Simulation(this.model);
        await simulation.simulate();
        resolve(this.logText);
    })
    
    //simulation.report();
    

}




}`

let dCode = `this.data.partArrivalDist = {type:Distributions.Exponential, param1:5}
    this.data.machineProcessTime = {type:Distributions.Exponential, param1:3}`;

let eCode = `[

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


    ];`

    let sCode = `{
        seed:1234,
        simTime:20000,
        useLogging:true
    }`;

let testModel = {
    data:{ code:dCode},
    entities:{ code:eCode},
    variables:{ code:"" },
    stations:{ code:""},
    routes:{ code:""},
    settings:{ code:sCode},
    charts:{ code:""}
}


var express = require('express');


 class SimulationRoutes{

    constructor(){
        this.pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let chance = new Chance();
        this.simulateRoutes = express.Router();
        this.simulateRoutes.route('/createscenario')
                .post( (req, res)=>{
                    try{
                        let scs = req.body;
                        this.validate(scs.model);
                        let co  = this.createCodeText(scs.model);

                        let fileName = chance.string({pool: this.pool, length:10});
                        fs.writeFile(`./src/${fileName}.ts`, co,  function(err) {
                            if(err) {
                                return console.log(err);
                            }

                            console.log("The file was saved!");

                            let Demo = require(`./src/${fileName}.ts`);

                            console.log(Demo.toString());


                            console.log(util.inspect(Demo, false, null))
                            let d = new Demo.Demo();
                              d.simulate().then(r=>{
                                res.status(201).send({text:r});
                                fs.unlink(`./src/${fileName}.ts`,(err) => {
                                        if (err) throw err;
                                        console.log(`successfully deleted ./src/${fileName}.ts`);
                                }) 
                        }); 
                        }); 


                        /* let d = new Demo();
                           let r = await d.simulate(); 
                            res.status(201).send(r); */

 
                    }
                    catch(err){
                    res.status(501).send("Noe bad skjedde");
                }
            });



            this.simulateRoutes.route('/createscenario')
                .get((req, res)=>{

                     try{
                        let scs = req.body;

                        this.validate(testModel);
                        let co  = this.createCodeText(testModel);

                        let fileName = chance.string({pool: this.pool, length:10});
                        fs.writeFile(`./src/${fileName}.ts`, co, function(err) {
                            if(err) {
                                return console.log(err);
                            }

                            console.log("The file was saved!");

                            let Demo = require(`./src/${fileName}.ts`);

                            console.log(Demo.toString());


                            console.log(util.inspect(Demo, false, null))
                            let d = new Demo.Demo();
                           d.simulate().then(r=>{


                                console.log("HEITEST");
                                res.status(201).send(r);
                                fs.unlink(`./src/${fileName}.ts`,(err) => {
                                        if (err) throw err;
                                        console.log(`successfully deleted ./src/${fileName}.ts`);
                                }) 
                        }); 

                        });
                        
                        
                        
                           

                        /* let d = new Demo();
                           let r = await d.simulate(); 
                            res.status(201).send(r); */

 
                    }
                    catch(err){
                        res.status(501).send(err);
                }
            });
        }





validate(model){
    model.entities.code = model.entities.code || "[]";
    model.stations.code = model.stations.code || "[]";
    model.routes.code = model.routes.code || "[]";
    model.charts.code = model.charts.code || "[]";
    model.variables.code = model.variables.code || "";
    model.data.code = model.data.code || "";
}


 createCodeText(model){
    return `import {Simulation} from './simulation/simulation'
import {Distributions} from './simulation/stats/distributions'


export class Demo{


logText:"";
data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;
variables:any = {};
constructor(){

    ${model.data.code}
    ${model.variables.code}

   

    this.model = {
        data:this.data,
        variables:this.variables,
        entities:this.getEntities(),
        preferences:this.getPreferences(),
        stations:this.getStations(),
        routes:this.getRoutes(),
        charts:this.getCharts()
    

    };

    this.model.preferences.logger = this.logger;
}

  getCharts(){
    let a = ${model.charts.code};
    return a;
    }

  getStations(){
    let a = ${model.stations.code};
    return a;
    }
 
  getRoutes(){
    let a = ${model.routes.code};
    return a;
    }

 getEntities(){
    let a = ${model.entities.code};
    return a;
    }
getPreferences() {
     let a = ${model.settings.code};
    return a;
}

logger =(message:string)=>{
    this.logText+=message;
}

  simulate() : Promise<string>{
   return new Promise<string>(async (resolve,reject)=>{
        let simulation = new Simulation(this.model);
        await simulation.simulate();
        resolve(this.logText);
    })
    
    //simulation.report();
    

}




}`;



    }

 }
 
   
 module.exports = SimulationRoutes;




