
var compile  = require("./api/simulate/simulate.js").compile;
var createModel  = require("./api/simulate/simulate.js").createModel;
var simulate  = require("./api/simulate/simulate.js").simulate;
const util = require('util')


let v = {value:10};
function test(){ return v;}
test();


 class Demo {
     
     
     constructor(){
      
       this.simpleObject = `{age: 10}`;
       this.complexObject = `{
          age: 10,
          newAge:getNumber(),
          getNumber:getNumber
        
        
        
        
       };
       
       
       function getNumber(){
        return 10;
       }`;
       
       
       this.data = `

let data                          = {}; //don't remove this line
let constants                          = {}; //don't remove this line


constants.aukraheimen        = "aukraheimen";
constants.patientA           = "patientA";
constants.patientLine        = "patientLine";
constants.entrance           = "entrance";
constants.extNurseStation    = "externalNurseStation";
constants.beds               = "beds";
constants.floyA              = "fløyA";
constants.floyB              = "fløyB";
constants.floyC              = "fløyC";
constants.baseA              = "baseA";
constants.baseB              = "baseB";
constants.baseC              = "baseC";

data.deathDistribution            = {name:"triangular", unit:"days", param1:240, param2:380, param3:620};
data.checkForNewPatientsTime      = {unit:"hours",value:2*24+10}; //each wednesday at 10:00
data.checkForNewPatientsInterval  = {unit:"days",value:14}; //every 14 day
data.nurseShiftTime               = {unit:"hours",value:7}; //each day at 0700
data.nurseShiftInterval           = {unit:"hours", value:8}; //change shift every 8th hour
data.wakeUpDepartmentTime         = {unit:"hours", value:7.5}; //wakeup each day at 0730
data.wakeUpDepartmentInterval     = {unit:"days", value:1}; //repeat every day
data.cleanRoomDuration            = {name:"triangular",param1:60,param2:90,param3:140}; //90 seconds
data.patientAArrivalTime          = {name:"exponential", unit:"days", param1:7}; //every 7th day
data.emergencyDistribution        = {name:"exponential", unit:"days", param1: 10}; //every 10th day
data.numberOfBedsAukraheimen      = 12;
data.nurseSpeed                   = 0.5 // m/s

data.nurses                       = [
                                      { name:"nurseA11", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:1},
                                      { name:"nurseA21", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:1},
                                      { name:"nurseA31", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:1},
                                      { name:"nurseA41", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:1},
                                      { name:"nurseB11", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:1},
                                      { name:"nurseB21", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:1},
                                      { name:"nurseB31", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:1},
                                      { name:"nurseB41", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:1},
                                      { name:"nurseC11", base: constants.baseC, walkTime:0 , floy:  constants.floyC,shift:1},
                                      { name:"nurseC21", base: constants.baseC, walkTime:0 , floy:  constants.floyC,shift:1},

                                      { name:"nurseA12", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:2},
                                      { name:"nurseA22", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:2},
                                      { name:"nurseA32", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:2},
                                      { name:"nurseA42", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:2},
                                      { name:"nurseB12", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:2},
                                      { name:"nurseB22", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:2},
                                      { name:"nurseB32", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:2},
                                      { name:"nurseB42", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:2},
                                      { name:"nurseC12", base: constants.baseC, walkTime:0 , floy:  constants.floyC,shift:2},
                                      { name:"nurseC22", base: constants.baseC, walkTime:0 , floy:  constants.floyC,shift:2},

                                      { name:"nurseA13", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:3},
                                      { name:"nurseA23", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:3},
                                      { name:"nurseA33", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:3},
                                      { name:"nurseA43", base: constants.baseA, walkTime:0 , floy:  constants.floyA,shift:3},
                                      { name:"nurseB13", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:3},
                                      { name:"nurseB23", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:3},
                                      { name:"nurseB33", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:3},
                                      { name:"nurseB43", base: constants.baseB, walkTime:0 , floy:  constants.floyB,shift:3},
                                      { name:"nurseC13", base: constants.baseC, walkTime:0 , floy:  constants.floyC,shift:3},
                                      { name:"nurseC23", base: constants.baseC, walkTime:0 , floy:  constants.floyC,shift:3}
                                    ];
        `;
       
       
       this.variables = `
let variables                         = {}; //don't remove this line - declaration
variables.kpi                         = {}; //don't remove this line - declaration
variables.patientA                    = {}; //patient of type A variables

variables.currentShift                = 0;  // values 1,2 and 3. Initial value 0 means that there are no current shifts in the beginning
variables.nursesShiftA                = []; //will hold the current shift of nurses at dep A
variables.nursesShiftB                = []; //will hold the current shift of nurses at dep B
variables.nursesShiftC                = []; //will hold the current shift of nurses at dep C
variables.patientA.count              = 0;  //current number of Type A patients in system
variables.patientA.countInLine        = 0;  //current number of Type A patients in line
variables.patientA.countInBuilding    = 0;  //current number of Type A patients in Aukraheimen
variables.patientA.countDeaths        = 0;  //current number of dead Type A patients in system
variables.patientA.countDeathsInLine  = 0;  //current number of dead Type A patients in line
variables.kpi.nursesTotalWalkTime     = 0;  //total time nurses has spent walking`;
       
       this.stations = `
let stations =
[
   { name: "entrance"},
   { name: "patientLine"},
   { name: "externalNurseStation"},
   { name: "PA1",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA2",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA3",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA4",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA5",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA6",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA7",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA8",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA9",     floy: constants.floyA, isPatientRoom:true },
   { name: "PA10",    floy: constants.floyA, isPatientRoom:true },
   { name: "PA11",    floy: constants.floyA, isPatientRoom:true },
   { name: "PA12",    floy: constants.floyA, isPatientRoom:true },
   { name: "lagerA1", floy: constants.floyA                     },
   { name: "lagerA2", floy: constants.floyA                     },
   { name: "baseA",   floy: constants.floyA                     },
   
   { name: "PB1",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB2",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB3",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB4",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB5",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB6",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB7",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB8",     floy: constants.floyB, isPatientRoom:true },
   { name: "PB9",     floy: constants.floyB, isPatientRoom:true },
   { name:"PB10",     floy: constants.floyB, isPatientRoom:true },
   { name:"PB11",     floy: constants.floyB, isPatientRoom:true },
   { name:"PB12",     floy: constants.floyB, isPatientRoom:true },
   { name:"lagerB1",  floy: constants.floyB                      },
   { name:"lagerB2",  floy: constants.floyB                      },
   { name:"baseB",    floy: constants.floyB                    },
   
   { name:"p1C",      floy: constants.floyC, isPatientRoom:true },
   { name:"p2C",      floy: constants.floyC, isPatientRoom:true },
   { name:"p3C",      floy: constants.floyC, isPatientRoom:true },                 
   { name:"p4C",      floy: constants.floyC, isPatientRoom:true },
   { name:"p5C",      floy: constants.floyC, isPatientRoom:true },
   { name:"p6C",      floy: constants.floyC, isPatientRoom:true }
];`;
       
       this.routes = `
let routes =
[
   { from:"externalNurseStation", to:"entrance", distance:15},
   { from:"patientLine", to:"entrance", distance:5,twoWay:false},
   { from:"entrance", to:"baseA", distance:38},
    
   { from:"baseA", to:"PA1",  distance:8},
   { from:"baseA", to:"PA2",  distance:11},
   { from:"baseA", to:"PA3",  distance:13},
   { from:"baseA", to:"PA4",  distance:19},
   { from:"baseA", to:"PA5",  distance:15},
   { from:"baseA", to:"PA6",  distance:19 },
    
   { from:"baseA", to:"PA7",  distance:5 },
   { from:"baseA", to:"PA8",  distance:8 },
   { from:"baseA", to:"PA9",  distance:13},
   { from:"baseA", to:"PA10", distance:19},
   { from:"baseA", to:"PA11", distance:15},
   { from:"baseA", to:"PA12", distance:19},
    
    
   { from:"PA1", to:"PA2",  distance:3    },
   { from:"PA1", to:"PA3",  distance:3+6  },
   { from:"PA1", to:"PA4",  distance:3+6+6},
   { from:"PA1", to:"PA5",  distance:3+6+2},
   { from:"PA1", to:"PA6",  distance:3+6+6},
   { from:"PA1", to:"PA7",  distance:8+5  },
   { from:"PA1", to:"PA8",  distance:8+8  },
   { from:"PA1", to:"PA9",  distance:8+13 },
   { from:"PA1", to:"PA10", distance:8+19 },
   { from:"PA1", to:"PA11", distance:8+15 },
   { from:"PA1", to:"PA12", distance:8+19 },
    
    
   { from:"PA2", to:"PA3",  distance:6    },
   { from:"PA2", to:"PA4",  distance:6+6+3},
   { from:"PA2", to:"PA5",  distance:6+3+2},
   { from:"PA2", to:"PA6",  distance:6+3+6},
   { from:"PA2", to:"PA7",  distance:11+5  },
   { from:"PA2", to:"PA8",  distance:11+8  },
   { from:"PA2", to:"PA9",  distance:11+13 },
   { from:"PA2", to:"PA10", distance:11+19 },
   { from:"PA2", to:"PA11", distance:11+15 },
   { from:"PA2", to:"PA12", distance:11+19 },
    
   { from:"PA3", to:"PA4",  distance:6     },
   { from:"PA3", to:"PA5",  distance:4     },
   { from:"PA3", to:"PA6",  distance:6     },
   { from:"PA3", to:"PA7",  distance:13+5  },
   { from:"PA3", to:"PA8",  distance:13+8  },
   { from:"PA3", to:"PA9",  distance:13+13 },
   { from:"PA3", to:"PA10", distance:13+19 },
   { from:"PA3", to:"PA11", distance:13+15 },
   { from:"PA3", to:"PA12", distance:13+19 },
    
   { from:"PA4", to:"PA5",  distance:3     },
   { from:"PA4", to:"PA6",  distance:8     },
   { from:"PA4", to:"PA7",  distance:19+5  },
   { from:"PA4", to:"PA8",  distance:19+8  },
   { from:"PA4", to:"PA9",  distance:19+13 },
   { from:"PA4", to:"PA10", distance:19+19 },
   { from:"PA4", to:"PA11", distance:19+15 },
   { from:"PA4", to:"PA12", distance:19+19 },
    
   { from:"PA5", to:"PA6",  distance:5     },
   { from:"PA5", to:"PA7",  distance:15+5  },
   { from:"PA5", to:"PA8",  distance:15+8  },
   { from:"PA5", to:"PA9",  distance:15+13 },
   { from:"PA5", to:"PA10", distance:15+19 },
   { from:"PA5", to:"PA11", distance:15+15 },
   { from:"PA5", to:"PA12", distance:15+19 },
    
   { from:"PA6", to:"PA7",  distance:19+5  },
   { from:"PA6", to:"PA8",  distance:19+8  },
   { from:"PA6", to:"PA9",  distance:19+13 },
   { from:"PA6", to:"PA10", distance:19+19 },
   { from:"PA6", to:"PA11", distance:19+15 },
   { from:"PA6", to:"PA12", distance:19+19 },
    
   { from:"PA7", to:"PA8",  distance:3  },
   { from:"PA7", to:"PA9",  distance:8  },
   { from:"PA7", to:"PA10",  distance:13 },
   { from:"PA7", to:"PA11", distance:10 },
   { from:"PA7", to:"PA12", distance:13 },
    
   { from:"PA8", to:"PA9",  distance:8  -3},
   { from:"PA8", to:"PA10",  distance:13-3 },
   { from:"PA8", to:"PA11", distance:10 -3},
   { from:"PA8", to:"PA12", distance:13 -3},
    
   { from:"PA9", to:"PA10",  distance:5},
   { from:"PA9", to:"PA11", distance:3},
   { from:"PA9", to:"PA12", distance:7},
    
   { from:"PA10", to:"PA11", distance:3},
   { from:"PA10", to:"PA12", distance:7},
    
   { from:"PA11", to:"PA12", distance:5},
      
];`;
       
       this.entities = `
let entities =
[
      {
       name:constants.aukraheimen,
       creation:{
         runOnce:true,
         onCreateModel:(building,ctx)=>{
           
         ctx.aukraHeimen = building;
           
         ctx.bedsResource = ctx.resource(ctx.constants.beds);
           building.users = new Map();
           
         }
      },
      resources:[
                   {
                     name:constants.beds,
                     capacity:data.numberOfBedsAukraheimen,
                     hasQueue:true,
                   }
                 ],
      
      plannedEvents :[
        {
          name : "checkForNewPatients",
          logEvent:true,
          dist:data.checkForNewPatientsTime,
          repeatInterval:data.checkForNewPatientsInterval,
          action: (building,ctx)=>{
            //Here the administration checks to see if there is enough beds available in the queue to add users to the building
          
          
          ctx.log(ctx.aukraHeimen.users.size);
          ctx.log( ctx.variables.patientA.countInBuilding);
           
            while(ctx.bedsResource.queue.size()>0 && ctx.aukraHeimen.users.size<ctx.bedsResource.capacity){
                //pop from the patient line
                var user = ctx.bedsResource.queue.pop(ctx.sim.time());
                ctx.variables.patientA.countInLine--;
                
                
                
                
                //userFromLine.fire("enterBuilding");
                //ctx.fireEvent("enterBuilding",user,ctx)
                  
                
                user.isInPatientLine = false;
                //This is necessary when using events that call out for all patients
                ctx.aukraHeimen.users.set(user.id,user);
                user.enterBuildingTime = ctx.sim.time();
                ctx.enter(ctx.constants.aukraheimen,user.enterBuildingTime);
                ctx.variables.patientA.countInBuilding++;
                
               
                
                var availableRoom = Array.from(ctx.stations.values())
                                        .find(station=>{return station.floy===ctx.constants.floyA && station.isPatientRoom &&!station.isOccupied;});
                
                ctx.log("av room:" +availableRoom);
                
                
                if(availableRoom)
                {
                  user.room=availableRoom;
                  availableRoom.isOccupied = true;
                }
                
                
                
                
                ctx.sequenceTask()
                      .first(ctx.walk(ctx.constants.patientLine,ctx.constants.entrance,user))
                      .then(ctx.walk(ctx.constants.entrance,ctx.constants.baseA,user))
                      .then(ctx.walk(ctx.constants.baseA,user.room.name,user))
                      .run();
            }
            
          }
           
        },  //Check for new patients
        {
          name : "nurseShift",
          logEvent:false,
          logMessage :"shift",
          dist:data.nurseShiftTime,
          repeatInterval:data.nurseShiftInterval,
          action: (building,ctx)=>{
           
           
                
                
              ctx.variables.nursesShiftA  = ctx.data.nurses.filter(nurse=>{
              
                      return nurse.floy==ctx.constants.floyA && nurse.shift==ctx.variables.currentShift;
                });
                
                ctx.variables.nursesShiftA.forEach(nurse=>{
                   
                    //walk from current station and out to external nurse station
                  ctx.sequenceTask()
                      .first(ctx.walk(nurse.currentStation,ctx.constants.baseA,nurse))
                      .then(ctx.walk(ctx.constants.baseA,ctx.constants.entrance,nurse))
                      .then(ctx.walk(ctx.constants.entrance,ctx.extNurseStation,nurse))
                      .run();
                });
                
                
                //Change the current shift
                ctx.variables.currentShift = 
                  ctx.variables.currentShift===3 ? 1 : ctx.variables.currentShift+1;
                
               
                 ctx.variables.nursesShiftA  = ctx.data.nurses.filter(nurse=>{
                      return nurse.floy==ctx.constants.floyA && nurse.shift==ctx.variables.currentShift;
                });
                
               
               
               
               ctx.variables.nursesShiftA.forEach(nurse=>{
                    ctx.sequenceTask()
                      .first(ctx.walk(ctx.constants.extNurseStation,ctx.constants.entrance,nurse))
                      .then(ctx.walk(ctx.constants.entrance,ctx.constants.baseA,nurse))
                      .run();
                });
         }
         
        }, //nurseshift
        
        
        
        {
          name : "wakeupDepartmentA",
          logMessage :"wakeup department A",
          dist:data.wakeUpDepartmentTime,
          repeatInterval:data.wakeUpDepartmentInterval,
          action: (building,ctx)=>{

           //The nurses have to help the patients to dress up and wash etc
           //4 nurses gets 3 rooms each
           
           var occupiedRooms = Array.from(ctx.stations.values())
                                        .filter(station=>{return station.floy===ctx.constants.floyA && station.isPatientRoom &&station.isOccupied;});
              
              
           
         
         //The nurses only clean the rooms that are used
         if(occupiedRooms.length>0){
           
           
           
           
           //let nursesA = ctx.filterFløy(ctx.nurses,ctx.floyA);
             let nursesA = ctx.data.nurses.filter(nurse=>{return nurse.floy===ctx.constants.floyA});
             
             
            let wakeupTask = ctx.mnServersTask(occupiedRooms,nursesA,ctx.data.cleanRoomDuration);
            
            
            
          wakeupTask.run();
           
           
           
           
           
         }
         
        
         
        
           
               
            
          }
           
        },  //wakeup
        
        
        
      ]
        
    },  //aukraheimen
   
      {
          name:"patientA",
          creation:{
            
            onCreateModel:(user,ctx)=>{
            
                  ctx.variables.patientA.count++,
                  user.isInPatientLine = true;
                  ctx.variables.patientA.countInLine++;
                  ctx.bedsResource.queue.push(user,ctx.sim.time());
                  user.currentStation = ctx.constants.patientLine;
                  //logPopulation(ctx);
            },
            dist:data.patientAArrivalTime
            
          },
          randomEvents:[
            {
              //The patient has an emergency, which needs to be treated immediately, but queued
              name:"disposal",
              logEvent:true,
              numberOfRuns:1,
              logMessage :"DEATH",
              dist:data.deathDistribution,
              action:(user,ctx)=>{
                      
                  ctx.removeModelItem(user);
                
                   if(user.isInPatientLine){
                      //remove the patient from the patient line
                      ctx.bedsResource.queue.remove(user,ctx.sim.time());
                      ctx.variables.patientA.countDeathsInLine ++;
                      ctx.variables.patientA.countInLine--;
                        ctx.logTask(true,'DEATH IN LINE:user created at: '+user.createdAt.toString());
                    }
                    else{
                      //remove the patient from the hospital
                      ctx.variables.patientA.countDeaths ++;
                      ctx.variables.patientA.countInBuilding--;
                      ctx.aukraHeimen.users.delete(user.id);
                      ctx.leave(ctx.constants.aukraheimen,user.enterBuildingTime,ctx.sim.time());
                      
                     
                      ctx.logTask(true,'DEATH: user created at: '+user.createdAt.toString());
                     
                     
                      user.room.isOccupied = false;
                      user.room = null;
                    }
                  //logPopulation(ctx);
              }
            },
            {
              //The patient has an emergency, which needs to be treated immediately, but queued
              name:"emergency",
              dist:data.emergencyDistribution,
              action:(user,ctx)=>{
              }
            } 
          ]
    },  //patient type A
    
      {
         name:"nurse",
         creation:{
           runOnce:true,
           runBatch:true,
           batchSize:data.nurses.length,
           onCreateModel:(nurses,ctx)=>{
             //assign a base for each nurse
             
                 for (var i = 0; i < ctx.data.nurses.length; i++) {
                 
                 nurses[i] = Object.assign({},ctx.data.nurses[i]);
                  nurses[i].currentStation = ctx.constants.extNurseStation;
                 
                 //So that we may directly use this.nurses
                  ctx.data.nurses[i] = nurses[i];
                   
                   
                 }
             
           }
           
         }
      }   //nurse
];`
       
       this.preferences = `
let preferences =
{       
  seed        : 1234,
  simTime     : 2*365*24*60, //two years
  logVerbose  : false,
  logEvents   : false,
  logWalking  : true
};`;
       
       
       
       this.code = {
         data:this.data,
         variables:this.variables,
         stations:this.stations,
         routes:this.routes,
         preferences:this.preferences,
         entities:this.entities
        };
       
     }
   
   
   
   
   compileSimpleObject(){
        let result =   compile(this.simpleObject);
        console.log(util.inspect(result));
   }
   
    compileComplexObject(){
        let result =   compile(this.complexObject);
        console.log(util.inspect(result));
   }
   
   
   compileSimulation(){
   
        let result =   createModel(this.code);
        console.log(util.inspect(result,false,null));
   }
   
   runSimulation(){
    
        simulate(this.code);
   }
 }
    
    








var D = new Demo();

// D.compileSimpleObject();
// D.compileComplexObject();
 //D.compileSimulation();
D.runSimulation();



 
















module.exports = Demo;