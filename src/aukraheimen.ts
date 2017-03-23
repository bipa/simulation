


import {Simulation,ExistingVariables} from './simulation/simulation'
import {Distributions} from './simulation/stats/distributions'
import {Route} from './simulation/model/route'
import {Station} from './simulation/model/station'
import {Entity} from './simulation/model/entity'
import {Resource} from './simulation/model/resource'


export class Demo{


data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;

constructor(){

    this.data.patientANeedsMedicinePb       = 0.6;
    this.data.patientWakeupDuration         = {type:Distributions.Exponential, param1:30};
    this.data.wakeUpDepartmentTime          = {unit:"hours", value:0}; //wakeup happens in beginning of the day
    this.data.wakeUpDepartmentInterval      = {unit:"days", value:1}; //repeat every 24 hours

    this.data.storageTripProbability = 0.3;

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
        new Route(this.data.stations.p7A,  this.data.stations.p8A       , 8),
        new Route(this.data.stations.p7A,  this.data.stations.p8A       , 13),
        new Route(this.data.stations.p7A,  this.data.stations.p8A       , 10),
        new Route(this.data.stations.p7A,  this.data.stations.p8A       , 13),

        new Route(this.data.stations.p8A,  this.data.stations.p9A       , 8-3),
        new Route(this.data.stations.p8A,  this.data.stations.p9A       , 13-3),
        new Route(this.data.stations.p8A,  this.data.stations.p9A       , 10-3),
        new Route(this.data.stations.p8A,  this.data.stations.p9A       , 13-3),

        new Route(this.data.stations.p9A,  this.data.stations.p10A      , 5),
        new Route(this.data.stations.p9A,  this.data.stations.p11A      , 3),
        new Route(this.data.stations.p9A,  this.data.stations.p12A      , 7),

        new Route(this.data.stations.p10A,  this.data.stations.p11A     , 3),
        new Route(this.data.stations.p10A,  this.data.stations.p12A     , 7),

        new Route(this.data.stations.p11A,  this.data.stations.p12A     ,  5),

    ]

    this.data.routes = Simulation.routes(this.data.routes,this.data.rooms);

    let variables : any                         = {}; //don't remove this line - declaration
    variables.kpi                      = {}; //don't remove this line - declaration
    variables.kpi.queueLength = 0;

    this.model = {
        data:this.data,
        variables:variables,
        stations:this.data.rooms,
        routes:this.data.routes,
        entities:this.getEntities(),
        preferences:this.getPreferences()

    

    };

}
 

 

 getEntities(){
    return [
        {
            type:"patientA",
            creation:{
                runOnce:true,
                quantity:12,
                createBatch:(patients : Entity[],ctx : Simulation)=>{
                    ctx.tasks.allocateToProperty(patients,ctx.data.patientRooms, "room");
                
                }    
            }
        }, 
        {
            type:"nurse",
            creation:{
                runOnce:true,
                quantity:4,
                createInstance:(nurse : Entity,ctx : Simulation)=>{
                    nurse.currentStation = ctx.data.stations.base;
                },    
                createBatch:(nurses : Entity[],ctx : Simulation)=>{
                    ctx.data.nursesDepA = nurses;
                
                },
                plannedEvents:[
                    {
                        name:"wakeup",
                        message:"wakeup department A",
                        dist:this.data.wakeUpDepartmentTime,
                        repeatInterval:this.data.wakeUpDepartmentInterval,
                        action: async (patient : Entity,ctx : Simulation)=>{
                        
                          if(ctx.tasks.yesNo(ctx.data.patientANeedsMedicine)){
                               /* let seizeResult = await ctx.seize(patient,ctx.data.nursesDepA,ctx.queue("nursesQueue"));
                                await ctx.walkTo(seizeResult.resource,patient.currentStation);  
                                await ctx.walkTo(seizeResult.resource,ctx.data.stations.medicine);
                                await ctx.walkTo(seizeResult.resource,patient.currentStation);    
*/
                               
                          }
                    
                      /*              
                          let enqueueResult = await ctx.enqueue(patientRoom,ctx.queue("nursesQueue"));

                          let seizeResult   = await ctx.seizeOneFromManyResources(patientRoom,ctx.data.nursesDepA);

                          let dequeueResult = await ctx.dequeue(patientRoom,ctx.queue("nursesQueue"));

                          let delayResult   = await ctx.delay(patientRoom,seizeResult.resource,ctx.data.machineProcessTime);                
                          
                          let releaseResult = await ctx.release(patientRoom,seizeResult.resource);
                          
                          let disposeResult = await ctx.dispose(patientRoom);*/
                        }
                    }
                ]
            }
        },
        {
            type:"aukraheimen",
            name:"aukraheimen",
            creation:{
                runOnce:true,
                createInstance: (aukraHeimen : Entity,ctx:Simulation)=>{



               } 
            },
            plannedEvents:[
                {
                    name:"wakeup",
                    message:"wakeup department A",
                    dist:this.data.wakeUpDepartmentTime,
                    repeatInterval:this.data.wakeUpDepartmentInterval,
                    action: (aukraheimen : Entity,ctx : Simulation)=>{
                        
                            ctx.data.stations.patientRooms.forEach(async (patientRoom : Entity) => {
                                
                                let enqueueResult = await ctx.tasks.enqueue(patientRoom,ctx.queue("nursesQueue"));

                                let seizeResult   = await ctx.tasks.seizeOneFromManyResources(patientRoom,ctx.data.nursesDepA);

                                let dequeueResult = await ctx.tasks.dequeue(patientRoom,ctx.queue("nursesQueue"));

                                let delayResult   = await ctx.tasks.delay(patientRoom,seizeResult.resource,ctx.data.machineProcessTime);                
                            
                                let releaseResult = await ctx.tasks.release(patientRoom,seizeResult.resource);
                                
                                let disposeResult = await ctx.tasks.dispose(patientRoom);
                            });

                    }
                }
            ]
        }

        


    ];
}









getPreferences() {

    return {
        seed:1234,
        simTime:200,
        useLogging:true
    }



}



  async simulate() {
        let simulation = new Simulation(this.model);
        let simRes = await simulation.simulate();
        //simulation.report();

}




}

let d = new Demo();
d.simulate();