import {Simulation,ExistingVariables} from './simulation/simulation'
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

    
this.data.numberOfNurses                    = 4;
    this.data.patientANeedsMedicinePb       = 0.3;
    this.data.nurseFindMedicineDuration     = {unit:Units.Minute,value:3};
    this.data.patientWakeupDuration         = {unit:Units.Minute,type:Distributions.Triangular, param1:5,param2:8,param3:15};
    this.data.wakeUpDepartmentTime          = {unit:Units.Hour, value:0}; //wakeup happens in beginning of the day
    this.data.wakeUpDepartmentInterval      = {unit:Units.Day, value:1}; //repeat every 24 hours
    this.data.storageTripProbability        = 0.3;


    this.data.stations  = {};
    
    this.data.stations  = {};
    this.data.stations.p1A = new Station("patientRoom1",1);
    this.data.stations.p2A = new Station("patientRoom2",1);
    this.data.stations.p3A = new Station("patientRoom3",1);
    this.data.stations.p4A = new Station("patientRoom4",1);
    this.data.stations.p5A = new Station("patientRoom5",1);
    this.data.stations.p6A = new Station("patientRoom6",1);
    this.data.stations.p7A = new Station("patientRoom7",1);
    this.data.stations.p8A = new Station("patientRoom8",1);
    this.data.stations.p9A = new Station("patientRoom9",1);
    this.data.stations.p10A = new Station("patientRoom10",1);
    this.data.stations.p11A = new Station("patientRoom11",1);
    this.data.stations.p12A = new Station("patientRoom12",1);
    this.data.stations.storage = new Station("storage1");
    this.data.stations.base = new Station("base");
    this.data.stations.medicine = new Station("medicine");
    this.data.stations.breakfast = new Station("breakfast");
    
    
    
    this.data.patientRooms = Simulation.getFromData(this.data.stations, s=>{ return s.tag===1});
    this.data.rooms = Simulation.stations(this.data.stations);
    this.data.routes=[



        new Route(this.data.stations.medicine,  this.data.stations.p1A  , -5+8),
        new Route(this.data.stations.medicine,  this.data.stations.p2A  , -5+11),
        new Route(this.data.stations.medicine,  this.data.stations.p3A  , -5+14),
        new Route(this.data.stations.medicine,  this.data.stations.p4A  , -5+19),
        new Route(this.data.stations.medicine,  this.data.stations.p5A  , -5+15),
        new Route(this.data.stations.medicine,  this.data.stations.p6A  , -5+19),
        new Route(this.data.stations.medicine,  this.data.stations.p7A  , 5+2+5),
        new Route(this.data.stations.medicine,  this.data.stations.p8A  , 5+2+8),
        new Route(this.data.stations.medicine,  this.data.stations.p9A  , 5+2+13),
        new Route(this.data.stations.medicine,  this.data.stations.p10A  ,5+2+19),
        new Route(this.data.stations.medicine,  this.data.stations.p11A  ,5+2+15),
        new Route(this.data.stations.medicine,  this.data.stations.p12A  ,5+2+19),
        new Route(this.data.stations.medicine,  this.data.stations.storage  ,7),
        new Route(this.data.stations.medicine,  this.data.stations.breakfast  ,7),

        new Route(this.data.stations.breakfast,  this.data.stations.p1A  ,   3),
        new Route(this.data.stations.breakfast,  this.data.stations.p2A  ,   11-8),
        new Route(this.data.stations.breakfast,  this.data.stations.p3A  ,   14-8),
        new Route(this.data.stations.breakfast,  this.data.stations.p4A  ,   19-8),
        new Route(this.data.stations.breakfast,  this.data.stations.p5A  ,   15-8),
        new Route(this.data.stations.breakfast,  this.data.stations.p6A  ,   19-8),

        new Route(this.data.stations.breakfast,  this.data.stations.p7A  ,   3),
        new Route(this.data.stations.breakfast,  this.data.stations.p8A  ,   2),
        new Route(this.data.stations.breakfast,  this.data.stations.p9A  ,   7),
        new Route(this.data.stations.breakfast,  this.data.stations.p10A  ,  13),
        new Route(this.data.stations.breakfast,  this.data.stations.p11A  ,  11),
        new Route(this.data.stations.breakfast,  this.data.stations.p12A  ,  23),
        new Route(this.data.stations.breakfast,  this.data.stations.storage  ,  8),

        
        new Route(this.data.stations.storage,  this.data.stations.p1A  ,  2+ 8),
        new Route(this.data.stations.storage,  this.data.stations.p2A  ,  2+ 11),
        new Route(this.data.stations.storage,  this.data.stations.p3A  ,  2+ 14),
        new Route(this.data.stations.storage,  this.data.stations.p4A  ,  2+ 19),
        new Route(this.data.stations.storage,  this.data.stations.p5A  ,  2+ 15),
        new Route(this.data.stations.storage,  this.data.stations.p6A  ,  2+ 19),

        new Route(this.data.stations.storage,  this.data.stations.p7A  ,  -2+ 5),
        new Route(this.data.stations.storage,  this.data.stations.p8A  ,  -2+ 8),
        new Route(this.data.stations.storage,  this.data.stations.p9A  ,  -2+ 13),
        new Route(this.data.stations.storage,  this.data.stations.p10A  , -2+ 19),
        new Route(this.data.stations.storage,  this.data.stations.p11A  , -2+ 15),
        new Route(this.data.stations.storage,  this.data.stations.p12A  , -2+ 19),

        new Route(this.data.stations.base,  this.data.stations.p1A  ,   8),
        new Route(this.data.stations.base,  this.data.stations.p2A  ,   11),
        new Route(this.data.stations.base,  this.data.stations.p3A  ,   14),
        new Route(this.data.stations.base,  this.data.stations.p4A  ,   19),
        new Route(this.data.stations.base,  this.data.stations.p5A  ,   15),
        new Route(this.data.stations.base,  this.data.stations.p6A  ,   19),
        new Route(this.data.stations.base,  this.data.stations.p7A  ,   5),
        new Route(this.data.stations.base,  this.data.stations.p8A  ,   8),
        new Route(this.data.stations.base,  this.data.stations.p9A  ,   13),
        new Route(this.data.stations.base,  this.data.stations.p10A  ,  19),
        new Route(this.data.stations.base,  this.data.stations.p11A  ,  15),
        new Route(this.data.stations.base,  this.data.stations.p12A  ,  19),
        new Route(this.data.stations.base,  this.data.stations.storage  ,  3),
        new Route(this.data.stations.base,  this.data.stations.breakfast  ,  8),
        new Route(this.data.stations.base,  this.data.stations.medicine  ,  5),

        new Route(this.data.stations.p1A,  this.data.stations.p2A   ,    3),
        new Route(this.data.stations.p1A,  this.data.stations.p3A   ,    3+6),
        new Route(this.data.stations.p1A,  this.data.stations.p4A   ,    3+6+6),
        new Route(this.data.stations.p1A,  this.data.stations.p5A   ,    3+6+2),
        new Route(this.data.stations.p1A,  this.data.stations.p6A   ,    3+6+6),

        new Route(this.data.stations.p1A,  this.data.stations.p7A   ,    8+5),
        new Route(this.data.stations.p1A,  this.data.stations.p8A   ,    8+8),
        new Route(this.data.stations.p1A,  this.data.stations.p9A   ,    8+13),
        new Route(this.data.stations.p1A,  this.data.stations.p10A   ,    8+19),
        new Route(this.data.stations.p1A,  this.data.stations.p11A   ,    8+15),
        new Route(this.data.stations.p1A,  this.data.stations.p12A   ,    8+19),

        new Route(this.data.stations.p2A,  this.data.stations.p3A      , 6),
        new Route(this.data.stations.p2A,  this.data.stations.p4A      , 6+6+3),
        new Route(this.data.stations.p2A,  this.data.stations.p5A      , 6+3+2),
        new Route(this.data.stations.p2A,  this.data.stations.p6A      , 6+3+3),

        new Route(this.data.stations.p2A,  this.data.stations.p7A      , 11+5),
        new Route(this.data.stations.p2A,  this.data.stations.p8A      , 11+8),
        new Route(this.data.stations.p2A,  this.data.stations.p9A      , 11+13),
        new Route(this.data.stations.p2A,  this.data.stations.p10A      , 11+19),
        new Route(this.data.stations.p2A,  this.data.stations.p11A      , 11+15),
        new Route(this.data.stations.p2A,  this.data.stations.p12A      , 11+19),

        new Route(this.data.stations.p3A,  this.data.stations.p4A       , 6),
        new Route(this.data.stations.p3A,  this.data.stations.p5A       , 4),
        new Route(this.data.stations.p3A,  this.data.stations.p6A       , 6),
        new Route(this.data.stations.p3A,  this.data.stations.p7A       , 13+5),
        new Route(this.data.stations.p3A,  this.data.stations.p8A       , 13+8),
        new Route(this.data.stations.p3A,  this.data.stations.p9A       , 13+13),
        new Route(this.data.stations.p3A,  this.data.stations.p10A       , 13+19),
        new Route(this.data.stations.p3A,  this.data.stations.p11A       , 13+15),
        new Route(this.data.stations.p3A,  this.data.stations.p12A       , 13+19),

        new Route(this.data.stations.p4A,  this.data.stations.p5A       , 3),
        new Route(this.data.stations.p4A,  this.data.stations.p6A       , 8),
        new Route(this.data.stations.p4A,  this.data.stations.p7A       , 19+5),
        new Route(this.data.stations.p4A,  this.data.stations.p8A       , 19+8),
        new Route(this.data.stations.p4A,  this.data.stations.p9A       , 19+13),
        new Route(this.data.stations.p4A,  this.data.stations.p10A       , 19+19),
        new Route(this.data.stations.p4A,  this.data.stations.p11A       , 15+15),
        new Route(this.data.stations.p4A,  this.data.stations.p12A       , 15+19),

        new Route(this.data.stations.p5A,  this.data.stations.p6A       , 5),
        new Route(this.data.stations.p5A,  this.data.stations.p7A       , 15),
        new Route(this.data.stations.p5A,  this.data.stations.p8A       , 15+8),
        new Route(this.data.stations.p5A,  this.data.stations.p9A       , 15+13),
        new Route(this.data.stations.p5A,  this.data.stations.p10A       , 15+19),
        new Route(this.data.stations.p5A,  this.data.stations.p11A       , 15+15),
        new Route(this.data.stations.p5A,  this.data.stations.p12A       , 15+19),


        new Route(this.data.stations.p6A,  this.data.stations.p7A       , 19+5),
        new Route(this.data.stations.p6A,  this.data.stations.p8A       , 19+8),
        new Route(this.data.stations.p6A,  this.data.stations.p9A       , 19+13),
        new Route(this.data.stations.p6A,  this.data.stations.p10A       , 19+19),
        new Route(this.data.stations.p6A,  this.data.stations.p11A       , 19+15),
        new Route(this.data.stations.p6A,  this.data.stations.p12A       , 19+19),



        new Route(this.data.stations.p7A,  this.data.stations.p8A       , 3),
        new Route(this.data.stations.p7A,  this.data.stations.p9A       , 8),
        new Route(this.data.stations.p7A,  this.data.stations.p10A       , 13),
        new Route(this.data.stations.p7A,  this.data.stations.p11A       , 10),
        new Route(this.data.stations.p7A,  this.data.stations.p12A       , 13),

        new Route(this.data.stations.p8A,  this.data.stations.p9A       , 8-3),
        new Route(this.data.stations.p8A,  this.data.stations.p10A       , 13-3),
        new Route(this.data.stations.p8A,  this.data.stations.p11A       , 10-3),
        new Route(this.data.stations.p8A,  this.data.stations.p12A       , 13-3),

        new Route(this.data.stations.p9A,  this.data.stations.p10A      , 5),
        new Route(this.data.stations.p9A,  this.data.stations.p11A      , 3),
        new Route(this.data.stations.p9A,  this.data.stations.p12A      , 7),

        new Route(this.data.stations.p10A,  this.data.stations.p11A     , 3),
        new Route(this.data.stations.p10A,  this.data.stations.p12A     , 7),

        new Route(this.data.stations.p11A,  this.data.stations.p12A     ,  5),

    ]

    let variables : any = {}; //don't remove this line - declaration
variables.kpi = {}; //don't remove this line - declaration
variables.existing = [
    {type:"patientA",variable:ExistingVariables.entityTotalWaitTimePercentage,name:"patientATotalWaitTimePercentage",display:"Part ventetid %"},
    {type:"patientA",variable:ExistingVariables.entityTotalValueAddedTimePercentage,name:"patientATotalValueAddedTimePercentage",display:"Part VA tid %"},
    {type:"patientA",variable:ExistingVariables.entityTotalTransferTimePercentage,name:"patientATotalTransferTimePercentage",display:"Parttransfer tid %"},
    {type:"nurse",variable:ExistingVariables.resourceTotalBusyTimePercentage,name:"nurseTotalBusyTimePercentage",display:"Worker busy %"},
    {type:"nurse",variable:ExistingVariables.resourceTotalIdleTimePercentage,name:"nurseTotalIdleTimePercentage",display:"Worker idle %"},
    {type:"nurse",variable:ExistingVariables.resourceTotalWaitTimePercentage,name:"nurseTotalWaitTimePercentage",display:"Worker wait %"},
    {type:"nurse",variable:ExistingVariables.resourceTotalTransferTimePercentage,name:"nurseTotalTransferTimePercentage",display:"Worker transfer %"},


]                  

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
    let a = [
            { variable:"nurseTotalBusyTimePercentage"},
            { variable:"nurseTotalIdleTimePercentage"},
            { variable:"nurseTotalWaitTimePercentage"}
];
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
    let a = [
{
            type:"patientA",
            creation:{
                runOnce:true,
                quantity:12,
                createBatch:function*(patients : Entity[],ctx : Simulation){
                    
                        ctx.data.patientsA = patients;
                        ctx.data.patientsA[0].room = ctx.data.stations.p1A;
                        ctx.data.patientsA[1].room = ctx.data.stations.p2A;
                        ctx.data.patientsA[2].room = ctx.data.stations.p3A;
                        ctx.data.patientsA[3].room = ctx.data.stations.p4A;
                        ctx.data.patientsA[4].room = ctx.data.stations.p5A;
                        ctx.data.patientsA[5].room = ctx.data.stations.p6A;

                        ctx.data.patientsA[6].room = ctx.data.stations.p7A;
                        ctx.data.patientsA[7].room = ctx.data.stations.p8A;
                        ctx.data.patientsA[8].room = ctx.data.stations.p9A;
                        ctx.data.patientsA[9].room = ctx.data.stations.p10A;
                        ctx.data.patientsA[10].room = ctx.data.stations.p11A;
                        ctx.data.patientsA[11].room = ctx.data.stations.p12A;

                        
                        ctx.data.patientsA[0].currentStation = ctx.data.stations.p1A;
                        ctx.data.patientsA[1].currentStation = ctx.data.stations.p2A;
                        ctx.data.patientsA[2].currentStation = ctx.data.stations.p3A;
                        ctx.data.patientsA[3].currentStation = ctx.data.stations.p4A;
                        ctx.data.patientsA[4].currentStation = ctx.data.stations.p5A;
                        ctx.data.patientsA[5].currentStation = ctx.data.stations.p6A;
                        
                        ctx.data.patientsA[6].currentStation = ctx.data.stations.p7A;
                        ctx.data.patientsA[7].currentStation = ctx.data.stations.p8A;
                        ctx.data.patientsA[8].currentStation = ctx.data.stations.p9A;
                        ctx.data.patientsA[9].currentStation = ctx.data.stations.p10A;
                        ctx.data.patientsA[10].currentStation = ctx.data.stations.p11A;
                        ctx.data.patientsA[11].currentStation = ctx.data.stations.p12A;
                }    
            },
            plannedEvents:[
                
                    {
                        name:"wakeup",
                        message:"wakeup department A",
                        dist:this.data.wakeUpDepartmentTime,
                        repeatInterval:this.data.wakeUpDepartmentInterval,
                        action: function* (patient : Entity,ctx : Simulation){
                        
    
                        
                            yield  ctx.tasks.enqueue(patient,ctx.queue("nursesQueue"));
        let seizeResult   = yield  ctx.tasks.seizeOneFromManyResources(patient,ctx.data.nursesDepA);
                            yield *ctx.tasks.dequeue(patient,ctx.queue("nursesQueue"));
                            yield *ctx.tasks.walkTo(seizeResult.resource,patient.currentStation);
                            if(ctx.tasks.yesNo(ctx.data.patientANeedsMedicine))
                            {
                                yield *ctx.tasks.walkTo(seizeResult.resource,ctx.data.stations.medicine);  
                                yield ctx.tasks.delayResource(seizeResult.resource,ctx.data.nurseFindMedicineDuration,ResourceStates.busy)
                                yield *ctx.tasks.walkTo(seizeResult.resource,patient.currentStation);    

                            }
                            yield  ctx.tasks.delay(patient,seizeResult.resource,ctx.data.patientWakeupDuration);
                            yield  ctx.tasks.release(patient,seizeResult.resource);     
                            if(!seizeResult.resource.isSeized) 
                            {
                                yield *ctx.tasks.walkTo(seizeResult.resource,ctx.data.stations.base);
                                    seizeResult.resource.setState();
                            }
                               
                      
                    
                        }
                    }
            ]
        }, 
        {
            type:"nurse",
            isResource:true,
            creation:{
                runOnce:true,
                quantity:this.data.numberOfNurses,
                createInstance:function*(nurse : Entity,ctx : Simulation){
                    nurse.currentStation = ctx.data.stations.base;
                },    
                createBatch:function*(nurses : Entity[],ctx : Simulation){
                    ctx.data.nursesDepA = nurses;
                
                }
            }
        },
        {
            type:"aukraheimen",
            name:"aukraheimen",
            creation:{
                runOnce:true
            },
            plannedEvents:[
                
                    {
                        name:"wakeup",
                        message:"wakeup department A",
                        dist:this.data.wakeUpDepartmentTime,
                        repeatInterval:this.data.wakeUpDepartmentInterval,
                        action: function* (patient : Entity,ctx : Simulation){
                        

                            ctx.log("HEI");

                          /*if(ctx.tasks.yesNo(ctx.data.patientANeedsMedicine)){
                                let seizeResult = await ctx.seize(patient,ctx.data.nursesDepA,ctx.queue("nursesQueue"));
                                await ctx.walkTo(seizeResult.resource,patient.currentStation);  
                                await ctx.walkTo(seizeResult.resource,ctx.data.stations.medicine);
                                await ctx.walkTo(seizeResult.resource,patient.currentStation);    

                               
                          }*/
                    
                    
                        }
                    }
            ]
        }

        


    ];;
    return a;
    }
getPreferences() {
     let a = 
  {
        seed:1234,
        simTime:200,
        baseUnit:Units.Day,
        useLogging:true,
        hoursPerDay:1
  };
    return a;
}





  simulate() : Promise<any>{
        let simulation = new Simulation(this.model);
        return  simulation.simulate();
    }




}