


var Chance = require('chance');
var fs = require('fs');
const util = require('util');

require('ts-node').register({ fast:true,project:"" });



let dCode = `this.data.partArrivalDist = {type:Distributions.Exponential, param1:5}
    this.data.machineProcessTime = {type:Distributions.Exponential, param1:3}`;

let eCode = `[

        {
            type:"part",
            creation:{
                dist:this.data.partArrivalDist,
                onCreateModel:async (part,ctx:Simulation)=>{

                    

                    let enqueueResult = await ctx.enqueue(part,ctx.queue("processQueue"));

                    let seizeResult   = await ctx.seizeResource(part,ctx.runtime.worker1);

                    let dequeueResult = await ctx.dequeue(part,ctx.queue("processQueue"));

                    let delayResult   = await ctx.delay(part,seizeResult.resource,ctx.data.machineProcessTime);                
                
                    let releaseResult = await ctx.release(part,seizeResult.resource);
                    
                    let disposeResult = await ctx.dispose(part);
                  


                }            
            }
        },

        {
            type:"worker",
            name:"worker1",
            isResource:true
        }


    ];`

    let sCode = `{
        seed:1234,
        simTime:200,
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
    return `import {Simulation,ExistingVariables} from './simulation/simulation'
import {Distributions,Units} from './simulation/stats/distributions'
import {Route} from './simulation/model/route'
import {Station} from './simulation/model/station'
import {Entity,EntityStates} from './simulation/model/entity'
import {Resource, ResourceStates} from './simulation/model/resource'


export class Demo{


logText:"";
data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;
variables:any = {};
constructor(){

    ${model.data.code}


    this.data.stations  = {};
    ${model.stations.code}
    ${model.routes.code}

    ${model.variables.code}

   this.variables = variables;

    this.model = {
        data:this.data,
        variables:variables,
        stations:this.data.rooms,
        routes:this.data.routes,
        entities:this.getEntities(),
        charts:this.getCharts(),
        preferences:this.getPreferences()
    

    };

    //this.model.preferences.logger = this.logger;
}

  getCharts(){
    let a = ${model.charts.code};
    return a;
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
    let a = ${model.entities.code};
    return a;
    }
getPreferences() {
     let a = ${model.settings.code};
    return a;
}





  simulate() : Promise<any>{
        let simulation = new Simulation(this.model);
        return  simulation.simulate();
    }




}`;



    }

 }
 
   
 module.exports = SimulationRoutes;




