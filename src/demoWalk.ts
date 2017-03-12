


import {Simulation} from './simulation/simulation'
import {Distributions} from './simulation/stats/distributions'
import {Route} from './simulation/model/route'
import {Station} from './simulation/model/station'
import {Entity} from './simulation/model/entity'
import {Resource} from './simulation/model/resource'


export class Demo{


data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;
logText:string ="";

constructor(){
    this.data.patientArrivalDist = {type:Distributions.Exponential, param1:5}
    this.data.doctorProcessTime = {type:Distributions.Exponential, param1:3}
    this.data.storageTripProbability = 0.3;

    this.data.stations  = {};
    this.data.stations.pasientQueue = new Station({name:"pasientQueue"});
    this.data.stations.office = new Station({name:"office"});
    this.data.stations.storage = new Station({name:"storage"});


    this.data.routes=[
        new Route(this.data.stations.pasientQueue,this.data.stations.office,20),
        new Route(this.data.stations.office,this.data.stations.storage,40),
    ]


    let variables : any                         = {}; //don't remove this line - declaration
    variables.kpi                      = {}; //don't remove this line - declaration
    variables.kpi.queueLength = 0;

    this.model = {
        data:this.data,
        variables:variables,
        stations:[this.data.stations.pasientQueue,this.data.stations.office,this.data.stations.storage],
        routes:this.data.routes,
        entities:this.getEntities(),
        preferences:this.getPreferences()

    

    };

}


 
 

 getEntities(){
    return [

        {
            type:"patient",
            creation:{
                dist:this.data.patientArrivalDist,
                onCreateModel:async (patient:Entity,ctx:Simulation)=>{

                    patient.currentStation = ctx.data.stations.pasientQueue;
                    ctx.runtime.doctor1.currentStation = ctx.data.stations.office;
                    let process = ctx.process("processpatient");



                    let seizeResult = await process.seize(patient,ctx.runtime.doctor1);

                    //The patient needs to walk to the office room
                    await ctx.walk(patient,patient.currentStation,ctx.data.stations.office);
                    // Now the doctor can process the patient
                    //Check if doctor needs t go to the storage room to get medicine
                    //with givn probability
                    if(ctx.yesNo(ctx.data.storageTripProbability))
                    {
                         let processTimes  = ctx.addRandomValue(ctx.data.doctorProcessTime);
                         //So the doctor processes the patient of half the time
                         await ctx.delay(patient,seizeResult.resource,processTimes[0]);                
                         //The doctor needs to go to the storage
                         await ctx.walk(ctx.runtime.doctor1 as Resource,ctx.data.stations.office,ctx.data.stations.storage )
                         //The doctor gets the correct medicine

                         process.release(patient,seizeResult.resource);
                         
                         ctx.dispose(patient);
                    }
                    else{
                        await ctx.delay(patient,seizeResult.resource,ctx.data.machineProcessTime);                
                
                        process.release(patient,seizeResult.resource);
                        
                        ctx.dispose(patient);
                    }

                    
                  


                }            
            }
        },

        {
            type:"doctor",
            name:"doctor1",
            isResource:true
        }


    ];
}









getPreferences() {

    return {
        seed:1234,
        simTime:200,
        useLogging:true,
        logger:this.logger
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