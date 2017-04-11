


import {Simulation,ExistingVariables} from './simulation/simulation'
import {Distributions,Units} from './simulation/stats/distributions'
import {Route} from './simulation/model/route'
import {Station} from './simulation/model/station'
import {Entity,EntityStates} from './simulation/model/entity'
import {Resource,ResourceStates} from './simulation/model/resource'


export class Demo{


data  :any                        = {}; //don't remove this line
constants  :any                        = {}; //don't remove this line
model:any;

constructor(){

    this.data.hoursPerDay                    = 1;
    this.data.numberOfNurses                 = 4;
    this.data.patientANeedsMedicinePb        = 0.3;
    this.data.patientBNeedsMedicinePb        = 0.7;
    this.data.patientANeedsHelpBreakfastProb = 0.2;
    this.data.patientBNeedsHelpBreakfastProb = 0.6;
    this.data.nurseFindMedicineDuration      = {unit:Units.Minute,value:3};
    this.data.patientAWakeupDuration         = {unit:Units.Minute,type:Distributions.Triangular, param1:5,param2:8,param3:15};
    this.data.patientBWakeupDuration         = {unit:Units.Minute,type:Distributions.Triangular, param1:8,param2:12,param3:16};
    this.data.wakeUpDepartmentTime           = {unit:Units.Hour, value:0}; //wakeup happens in beginning of the day
    this.data.wakeUpDepartmentInterval       = {unit:Units.Day, value:1}; //repeat every 24 hours
 
     
    this.data.patientAAcuteTime              = {unit:Units.Day,type:Distributions.Exponential, param1:6};
    this.data.patientBAcuteTime              = {unit:Units.Day,type:Distributions.Exponential, param1:3};
    this.data.patientAAcuteDuration          = {unit:Units.Minute,type:Distributions.Exponential, param1:20};
    this.data.patientBAcuteDuration          = {unit:Units.Minute,type:Distributions.Exponential, param1:40};

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

    this.data.routes = Simulation.routes(this.data.routes,this.data.rooms);

    let variables : any                         = {}; //don't remove this line - declaration
    variables.kpi                      = {}; //don't remove this line - declaration
    variables.patientsAverageWaitTime = 0;

        variables.nursesAverageIdleTime = 0;
        variables.nursesAverageBusyTime =0;
        variables.nursesAverageTransferTime=0;

    variables.noLog  ={};
    variables.noLog.daysCount=0;

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
                quantity:6,
                createBatch:function*(patients : Entity[],ctx : Simulation){
                    
                        ctx.data.patientsA = patients;
                        ctx.data.patientsA[0].room = ctx.data.stations.p1A;
                        ctx.data.patientsA[1].room = ctx.data.stations.p2A;
                        ctx.data.patientsA[2].room = ctx.data.stations.p3A;
                        ctx.data.patientsA[3].room = ctx.data.stations.p4A;
                        ctx.data.patientsA[4].room = ctx.data.stations.p5A;
                        ctx.data.patientsA[5].room = ctx.data.stations.p6A;


                        
                        ctx.data.patientsA[0].currentStation = ctx.data.stations.p1A;
                        ctx.data.patientsA[1].currentStation = ctx.data.stations.p2A;
                        ctx.data.patientsA[2].currentStation = ctx.data.stations.p3A;
                        ctx.data.patientsA[3].currentStation = ctx.data.stations.p4A;
                        ctx.data.patientsA[4].currentStation = ctx.data.stations.p5A;
                        ctx.data.patientsA[5].currentStation = ctx.data.stations.p6A;
                        
                }    
            },
            randomEvents:[
                  {
                    name:"acuteA",
                    message:"is acute",
                    dist:this.data.patientAAcuteTime,
                    action: function *(patientA : Entity,ctx:Simulation){
                        

                            let nurses = ctx.tasks.forceSeize(patientA,ctx.data.nursesDepA,2);
                            let nurse1 = nurses[0];
                            let nurse2 = nurses[1];

                           let simEvent1 =  ctx.tasks.interruptResource(nurse1);
                           let simEvent2 =  ctx.tasks.interruptResource(nurse2);
                           nurse1.setState(ResourceStates.busy);
                           nurse2.setState(ResourceStates.busy);

                           let func = function *(data,ctx:Simulation){

                                let simTime = ctx.simTime;
                                 //The resource goes to lunch
                                 
                                 //Walk to the patient                         
                                 yield *ctx.tasks.walkTo(data.nurse,data.patient.currentStation);
                                 //Treat the patient
                                 yield ctx.tasks.delay(data.patient,data.nurse,ctx.data.patientAAcuteDuration);
                                 yield  ctx.tasks.release(data.patient,data.nurse);     
                                 //the resource becomes idle
                                 //worker.nextState = ResourceStates.idle;
                                 //Continue with the task that was interrupted
                                 
                                 if(data.simEvent)
                                 {
                                            //The nurse had a task ongoing...walk back to stations
                                            //where nurse was before the acute incident
                                                
                                            let workLeft  = data.simEvent.deliverAt - simTime;
                                             data.simEvent.deliverAt = ctx.simTime+workLeft;
                                             //Continue with the task
                                             yield *ctx.tasks.walkTo(data.nurse,data.stationBefore);
                                             data.simEvent.deliverAt = ctx.simTime+workLeft;
                                             ctx.simulator.scheduleEvent(data.simEvent);
                                 }
                                 else{
                                     //Set the resource to idle
                                     data.nurse.setState(ResourceStates.idle);
                                     if(!data.nurse.isSeized)
                                     {
                                         //Go back to base
                                         yield *ctx.tasks.walkTo(data.nurse,ctx.data.stations.base);
                                         if(!data.nurse.isSeized){data.nurse.setState(ResourceStates.idle);}
                                     }
                                 }
                            }


                           ctx.tasks.newEvent("nurse1", `treats patient`,func,{simEvent:simEvent1,nurse:nurse1,patient:patientA,stationBefore:nurse1.currentStation});


                           ctx.tasks.newEvent("nurse2", `treats patient`,func,{simEvent:simEvent2,nurse:nurse2,patient:patientA,stationBefore:nurse2.currentStation});



                         
 
                    }
                }


            ],
            plannedEvents:[
                
                    {
                        name:"wakeupA",
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
                            yield  ctx.tasks.delay(patient,seizeResult.resource,ctx.data.patientAWakeupDuration);
                            yield  ctx.tasks.release(patient,seizeResult.resource);     
                            if(!seizeResult.resource.isSeized) 
                            {
                                yield *ctx.tasks.walkTo(seizeResult.resource,ctx.data.stations.base);
                                    seizeResult.resource.setState();
                            }
                               
                      
                    
                        }
                    }
            ]
        }, {
            type:"patientB",
            creation:{
                runOnce:true,
                quantity:6,
                createBatch:function*(patients : Entity[],ctx : Simulation){
                    
                        ctx.data.patientsB = patients;

                        ctx.data.patientsB[0].room = ctx.data.stations.p7A;
                        ctx.data.patientsB[1].room = ctx.data.stations.p8A;
                        ctx.data.patientsB[2].room = ctx.data.stations.p9A;
                        ctx.data.patientsB[3].room = ctx.data.stations.p10A;
                        ctx.data.patientsB[4].room = ctx.data.stations.p11A;
                        ctx.data.patientsB[5].room = ctx.data.stations.p12A;
                        
                        ctx.data.patientsB[0].currentStation = ctx.data.stations.p7A;
                        ctx.data.patientsB[1].currentStation = ctx.data.stations.p8A;
                        ctx.data.patientsB[2].currentStation = ctx.data.stations.p9A;
                        ctx.data.patientsB[3].currentStation = ctx.data.stations.p10A;
                        ctx.data.patientsB[4].currentStation = ctx.data.stations.p11A;
                        ctx.data.patientsB[5].currentStation = ctx.data.stations.p12A;
                }    
            },
            plannedEvents:[
                
                    {
                        name:"wakeupB",
                        message:"wakeup department A",
                        dist:this.data.wakeUpDepartmentTime,
                        repeatInterval:this.data.wakeUpDepartmentInterval,
                        action: function* (patient : Entity,ctx : Simulation){
                        
    
                        
                            yield  ctx.tasks.enqueue(patient,ctx.queue("nursesQueue"));
        let seizeResult   = yield  ctx.tasks.seizeOneFromManyResources(patient,ctx.data.nursesDepA);
                            yield *ctx.tasks.dequeue(patient,ctx.queue("nursesQueue"));
                            yield *ctx.tasks.walkTo(seizeResult.resource,patient.currentStation);
                            if(ctx.tasks.yesNo(ctx.data.patientBNeedsMedicine))
                            {
                                yield *ctx.tasks.walkTo(seizeResult.resource,ctx.data.stations.medicine);  
                                yield ctx.tasks.delayResource(seizeResult.resource,ctx.data.nurseFindMedicineDuration,ResourceStates.busy)
                                yield *ctx.tasks.walkTo(seizeResult.resource,patient.currentStation);    

                            }
                            yield  ctx.tasks.delay(patient,seizeResult.resource,ctx.data.patientBWakeupDuration);
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
            currentStation:this.data.stations.base,
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
            creation:{
                runOnce:true
            },
            plannedEvents:[
                
                    {
                        name:"startOfDay",
                        message:"startOfDay",
                        dist:this.data.wakeUpDepartmentTime,
                        repeatInterval:{unit:Units.Hour, value:this.data.hoursPerDay},
                        action: function* (aukreheimen : Entity,ctx : Simulation){
                        
                            ctx.data.patientsA.forEach((patient:Entity)=>{
                                ctx.recorder.startRecordEntityStats(patient,"waitTime");
                            })
                        
                            ctx.data.patientsB.forEach((patient:Entity)=>{
                                ctx.recorder.startRecordEntityStats(patient,"waitTime");
                            })

                            
                            ctx.data.nursesDepA.forEach((nurse:Resource)=>{
                                ctx.recorder.startRecordResourceStats(nurse,"idleTime");
                                ctx.recorder.startRecordResourceStats(nurse,"busyTime");
                                ctx.recorder.startRecordResourceStats(nurse,"transferTime");
                            })
                               
                      
                    
                        }
                    },
                    {
                       name:"endOfDay",
                       message:"endOfDay",
                       dist:{unit:Units.Hour, value:this.data.hoursPerDay-Simulation.epsilon},
                       repeatInterval:{unit:Units.Hour, value:this.data.hoursPerDay},
                       action: function* (aukreheimen : Entity,ctx : Simulation){

                           let totalWaitTime = 0;
                           ctx.data.patientsA.forEach((patient:Entity)=>{
                             totalWaitTime+=  ctx.recorder.endRecordEntityStats(patient,"waitTime").waitTime;
                           });


  
                           ctx.data.patientsB.forEach((patient:Entity)=>{
                               totalWaitTime+=  ctx.recorder.endRecordEntityStats(patient,"waitTime").waitTime;
                          });


                           let average = totalWaitTime / (ctx.data.patientsB.length+ctx.data.patientsA.length);

                           ctx.variables.patientsAverageWaitTime = (ctx.variables.patientsAverageWaitTime*ctx.variables.noLog.daysCount + average)/(ctx.variables.noLog.daysCount+1);
                       



                           let totalIdleTime = 0;
                           let totalBusyTime = 0;
                           let totalTransferTime = 0;

                            ctx.data.nursesDepA.forEach((nurse:Resource)=>{
                               totalIdleTime+= ctx.recorder.endRecordResourceStats(nurse,"idleTime",false).idleTime;
                                totalBusyTime+=ctx.recorder.endRecordResourceStats(nurse,"busyTime",false).busyTime;
                                totalTransferTime+=ctx.recorder.endRecordResourceStats(nurse,"transferTime").transferTime;
                            })
                               

                           let averageIdle = totalIdleTime / (ctx.data.nursesDepA.length);

                           let averageBusy = totalBusyTime / (ctx.data.nursesDepA.length);

                           let averageTransfer = totalTransferTime / (ctx.data.nursesDepA.length);


                            ctx.variables.nursesAverageIdleTime = (ctx.variables.nursesAverageIdleTime*ctx.variables.noLog.daysCount + averageIdle)/(ctx.variables.noLog.daysCount+1);
                            ctx.variables.nursesAverageBusyTime = (ctx.variables.nursesAverageBusyTime*ctx.variables.noLog.daysCount + averageBusy)/(ctx.variables.noLog.daysCount+1);
                            ctx.variables.nursesAverageTransferTime = (ctx.variables.nursesAverageTransferTime*ctx.variables.noLog.daysCount + averageTransfer)/(ctx.variables.noLog.daysCount+1);
                       

                           ctx.variables.noLog.daysCount++;

                      }
                    
                    }
            ]

        
        }

    ];
}




/*if(ctx.tasks.yesNo(ctx.data.patientANeedsMedicine)){
                                let seizeResult = await ctx.seize(patient,ctx.data.nursesDepA,ctx.queue("nursesQueue"));
                                await ctx.walkTo(seizeResult.resource,patient.currentStation);  
                                await ctx.walkTo(seizeResult.resource,ctx.data.stations.medicine);
                                await ctx.walkTo(seizeResult.resource,patient.currentStation);    

                               
                          }*/
                    
                           //Each patient needs a nurse to give medicine and
                           //And help to wake up




getPreferences() {

    return {
        seed:1234,
        simTime:40,
        baseUnit:Units.Day,
        useLogging:true,
        hoursPerDay:this.data.hoursPerDay
    }



}

simulateNonAsync(){
     let simulation = new Simulation(this.model);
        simulation.simulateNonAsync();
        simulation.report();
}

  async simulate() {
      try {
          
        let simulation = new Simulation(this.model);
        let simRes = await simulation.simulate();
        simulation.report();

      } catch (error) {
          console.log(error)
      }

}



}

let d = new Demo();
d.simulate();