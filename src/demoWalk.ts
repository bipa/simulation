


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
    this.data.stations.pasientQueue = new Station("pasientQueue");
    this.data.stations.p1A = new Station("patientRoom1");
    this.data.stations.p2A = new Station("patientRoom2");
    this.data.stations.p3A = new Station("patientRoom3");
    this.data.stations.p4A = new Station("patientRoom4");
    this.data.stations.p5A = new Station("patientRoom5");
    this.data.stations.p6A = new Station("patientRoom6");
    this.data.stations.p7A = new Station("patientRoom7");
    this.data.stations.p8A = new Station("patientRoom8");
    this.data.stations.p9A = new Station("patientRoom9");
    this.data.stations.p10A = new Station("patientRoom10");
    this.data.stations.p11A = new Station("patientRoom11");
    this.data.stations.p12A = new Station("patientRoom12");
    this.data.stations.storage1 = new Station("storage1");
    this.data.stations.storage2 = new Station("storage2");
    this.data.stations.base = new Station("base");
    this.data.stations.medicine = new Station("medicine");


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
        stations:this.getFromData(this.data.stations),
        routes:this.getFromData(this.data.routes),
        entities:this.getEntities(),
        preferences:this.getPreferences()

    

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
            type:"patient",
            creation:{
                dist:this.data.patientArrivalDist,
                createInstance:async (patient:Entity,ctx:Simulation)=>{

                    patient.currentStation = ctx.data.stations.pasientQueue;
                    ctx.runtime.doctor1.currentStation = ctx.data.stations.office;
                    let process = ctx.process("processpatient");


/*
                    let seizeResult   = await ctx.tasks.seizeResource(patient,ctx.runtime.worker1);

                    //The patient needs to walk to the office room
                    await ctx.tasks.walk(patient,patient.currentStation,ctx.data.stations.office);
                    // Now the doctor can process the patient
                    //Check if doctor needs t go to the storage room to get medicine
                    //with givn probability
                    if(ctx.tasks.yesNo(ctx.data.storageTripProbability))
                    {
                         let processTimes  = ctx.addRandomValue(ctx.data.doctorProcessTime);
                         //So the doctor processes the patient of half the time
                         await ctx.tasks.delay(patient,seizeResult.resource,processTimes[0]);                
                         //The doctor needs to go to the storage
                         await ctx.tasks.walk(ctx.runtime.doctor1 as Resource,ctx.data.stations.office,ctx.data.stations.storage )
                         //The doctor gets the correct medicine

                         await ctx.tasks.release(patient,seizeResult.resource);
                         
                         await ctx.tasks.dispose(patient);
                    }
                    else{
                        await ctx.tasks.delay(patient,seizeResult.resource,ctx.data.machineProcessTime);                
                
                        await ctx.tasks.release(patient,seizeResult.resource);
                        
                        await ctx.tasks.dispose(patient);
                    }
*/
                    
                  


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