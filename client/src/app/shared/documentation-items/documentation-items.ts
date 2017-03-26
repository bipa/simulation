import {Injectable, EventEmitter} from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {AngularFire,FirebaseListObservable} from 'angularfire2';
import { LoaderService } from '../../spinner.service';

export interface ISimulationModel {
  //entities:Entity[];
  entities:ICode;
  variables:ICode;
  stations: ICode;
  routes:ICode;
  settings:ICode;
}


export interface ICode{
  code:string;
  isDirty:boolean;
}

export class Chart {
  id: String;
  data: Object;
  height: any;
  width: any;
  
  constructor (config: any) {
    this.id = config.id;
    this.data = config.data;
    this.height = config.height || 400;
    this.width = config.width || '100%';
  }
}

export class SimulationModel implements ISimulationModel{

        data:ICode={code:null,isDirty:false};
        entities:ICode = {code:null,isDirty:false}; 
        variables:ICode = {code:null,isDirty:false};
        stations: ICode = {code:null,isDirty:false};
        routes:ICode= {code:null,isDirty:false};
        settings:ICode ={code:null,isDirty:false};
        charts : ICode= {code:null,isDirty:false};;




}


export enum Action {
    None =1,
    Initial,
    Save,
    New,
    Delete
}

export class EventLogItem{
    simTime:number;
    name:string;
    message:string;
    logItems:LogItem[];
}

export class LogItem{
    simTime:number;
    name:string;
    message:string;
}

export class Variable{

  constructor(name,value,isGroup = false){
    this.name = name;
    this.value= value;
    this.isGroup = isGroup;
  }
    isGroup: boolean;
    name:string;
    value:number;

}

export class Parameter{
    name:string;
    value:number;
}

export class Animation{
      imageName:string;
}

export class ScenarioError{
      type:string;
      message:string;

      constructor(type:string=null,message:string=null){
        this.type=type;
        this.message = message;
      }
}

export class Scenario{
      id:string;
      projectId:string;
      name:string;
      error:ScenarioError;
      stack:string;
      runtimeModel:any;
      isClosed:boolean;
      isRoot :boolean;
      isDirty:boolean;
      asterix:string;
      isValid:boolean;
      isSelected:boolean;
      isIncludedInSimulation:boolean;
      model:SimulationModel;
      log:EventLogItem[];

      constructor(projectId:string, name:string="root"){
        this.name = name;
        this.projectId = projectId;
        this.error = new ScenarioError();
        this.isClosed = false;
        this.isRoot = false;
        this.asterix = "";
        this.isDirty = false;
        this.isIncludedInSimulation = true;
        this.isValid= false;
        this.isSelected = false;
        this.model = getStubModellen();
        this.log = [];
      }


}



export class SimulationProject {
  id: string;
  categoryId:string;
  name: string;
  imageName:string;
 // selectedScenario:Scenario;
  //scenarioes:Scenario[];
  isValid:boolean;
 
constructor(){


      let sc = getMainScenario();
      sc.name= "Root";
      sc.isSelected  = true;
      sc.isRoot = true;


       this.id=null,
       this.name=null,
       this.categoryId=null,
       this.imageName="item_placeholder.png",
      // this.selectedScenario = new Scenario(),
       //this.scenarioes= [sc]
       this.isValid = false;
}



     removeScenario(scenario : Scenario){

       //  let id = this.scenarioes.indexOf(scenario);
       // this.scenarioes.splice(id,1);
       // this.selectedScenario = this.scenarioes[0];

      }








}

/*export interface Entity {
  name: string;
  creation: string;
  resources:string;
  plannedEvents: string;
  randomEvents:string
}
*/




 export interface SimulationCategory {
  id: string;
  name: string;
  summary:string;
  projects: SimulationProject[];
}




//export default ISimulationModel;



 /* * * ./app/emitter.service.ts * * */
// Credit to https://gist.github.com/sasxa
// Imports

@Injectable()
export class EmitterService {
    // Event store
    private static _emitters: { [ID: string]: EventEmitter<any> } = {};
    // Set a new event in the store with a given ID
    // as key
    static get(ID: string): EventEmitter<any> {
        if (!this._emitters[ID]) 
            this._emitters[ID] = new EventEmitter();
        return this._emitters[ID];
    }
}
 


@Injectable()
export class DocumentationItems {



scenarioes : Scenario[] = [];
projects : SimulationProject[] = [];
scenarioesPromise:Promise<Scenario[]>;
projectsPromise:Promise<SimulationProject[]>;
 DOCS =null;

categories : FirebaseListObservable<SimulationProject[]>;

private commentsUrl = 'http://localhost:3000/api/model/createscenario'; 
private scenarioesObservable :FirebaseListObservable<Scenario[]>;
private projectsObservable :FirebaseListObservable<SimulationProject[]>;



constructor(private loaderService : LoaderService, private http: Http, private af:AngularFire){


          this.scenarioesObservable = af.database.list(`/scenarioes`);
          this.scenarioesPromise = new Promise(
            (resolve,reject)=>{
                this.scenarioesObservable.subscribe(scenarioes=>{
                      this.scenarioes.length= 0;
                      scenarioes.forEach(scenario=>{
                          this.scenarioes.push(scenario);

                      });
                      resolve(this.scenarioes);
                    }
                );


            }
          );


          this.projectsObservable = af.database.list(`/projects`);
          this.projectsPromise = new Promise(
            (resolve,reject)=>{
                this.projectsObservable.subscribe(projects=>{
                      this.projects.length= 0;
                      projects.forEach(project=>{
                          this.projects.push(project);

                      });
                      resolve(this.projects);
                    }
                );


            }
          );

      



   /* let sc = getMainScenario();
    sc.name= "Hent";
    sc.isSelected  = true;
    sc.isRoot = true;
    this.scenarioes.push(sc);


    let sc1 = getMainScenario();
    sc1.name= "Veidekke";
    this.scenarioes.push(sc1);*/


  this.DOCS = [
  {
    id: 'arkitektur',
    name: 'Arkitektur',
    summary: 'Simulering av effektive arkitekturløsninger',
    projects: [
      {
        id: 'aukraheimen',
        categoryId:'arkitektur',
        imageName:"aukraheimen.png", 
        name: 'Aukraheimen', 
        //selectedScenario:this.scenarioes[0],
        scenarioes:this.scenarioes,
      }
      ]
  },
  {
    id: 'nav',
    name: 'Produksjon',
    summary: 'Simulering av effektive produksjonsprosesser',
    projects: [    ]
  },
  {
    id: 'layout',
    name: 'Transport',
    summary: 'Simulering av effektive transportløsninger',
    projects: [    ]
  }
 
];

/*this.categories = af.database.list("/categories");

this.categories.push(this.DOCS[0]);
this.categories.push(this.DOCS[1]);
this.categories.push(this.DOCS[2]);

*/






}

    newProject(project:SimulationProject){
      return new Promise<SimulationProject>((resolve,reject)=>{
          this.projectsObservable.push(project).then(

              s=>{
                project['$key'] = s.key;
                resolve(project);
              }

          ).catch(reject);
      })
      
    }


  async getProjects(categoryId:string){
        let result =  await this.projectsPromise;
        return result.filter(project=>{
          return project.categoryId===categoryId;
        })
    }

  async getProject(projectId:string){
        let result =  await this.projectsPromise;
        return result.find(project=>{
            return project['$key']===projectId;
        })
    }
  


   async getScenarioes(projectId:string){
        let result =  await this.scenarioesPromise;
        return result.filter(scenario=>{
          return scenario.projectId===projectId;
        })
    }


    newScenario(scenario:Scenario){
      return new Promise<Scenario>((resolve,reject)=>{
          this.scenarioesObservable.push(scenario).then(

              s=>{
                scenario['$key'] = s.key;
                resolve(scenario);
              }

          ).catch(reject);
      })
      
    }


deleteScenario(scenario){
    let path = `/scenarioes/${scenario["$key"]}`;
    let o =  this.af.database.object(path);
    return new Promise<any>((resolve,reject)=>{
              o.remove().then(resolve).catch(reject);
          })
}


updateScenario(scenario,saveModel){
   let path = `/scenarioes/${scenario["$key"]}`;
   let o =  this.af.database.object(path);
   return new Promise<any>((resolve,reject)=>{
             o.update(saveModel).then(resolve).catch(reject);
          })


}




    saveModel (body: Object): Promise<any> {
        let bodyString = JSON.stringify(body); // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers }); // Create a request option
        this.loaderService.showSpinner = true;
        return this.http.post(this.commentsUrl, body, options) // ...using post request
                         .map((res:Response) => 
                              res.json()) // ...and calling .json() on the response to return data
                         .catch((error:any) => {  
                            this.loaderService.showSpinner = false;
                           return Observable.throw(error.json().error || 'Server error')
                         })                          
                         .toPromise().then(res=>{

                            this.loaderService.showSpinner = false;
                            return res;

                         }); //...errors if any
    }


 



saveProject(SimulationProject){

}



createNewScenario(){

    var s =  new Scenario("aukraheimen","Aukraheimen");

    s.name = "Aukraheimen";
    s.projectId = "aukraheimen";
    //s.log =  createEventLog();
    s.model = getStubModellen();
}

  createNewItem() : SimulationProject {

      return  new SimulationProject();


  }

 


  removeItem(item : SimulationProject){

    let cat = this.getCategoryById(item.categoryId);
    let id = cat.projects.indexOf(item);
    cat.projects.splice(id,1);
  }


  addNewItem(idCat:string, item : SimulationProject){

    item.categoryId = idCat;
    let cat = this.getCategoryById(idCat);
    if(!item.id) item.id = item.name.toLowerCase();
    cat.projects.push(item);
  }

 getAllItems(){
    return this.DOCS.reduce((result, category) => result.concat(category.items), []);
  }

  getItemsInCategories(): SimulationCategory[] {
    return this.DOCS;
  }

 
  getItemById(id: string): SimulationProject {
    return this.getAllItems().find(i => i.id === id);
  }

  getCategoryById(id: string): SimulationCategory {
    return this.DOCS.find(c => c.id == id);
  }

  defaultChart(title) :  any{
        return {
          height:300,
          width:"100%",
          data:this.defaultChartData(title),
          "sim-data":{
              timeScale:60*24, //en dag
              nextTick:0 

          }
          
        }
  }

  defaultChartData(title) :  any{
    return {
        type: "line",  // Specify your chart type here.
      title: {
        text: title // Adds a title to your chart
      },
      noData:{
     	  text:"Empty Series"
 	  },
      legend: {
        align:"right",
        "vertical-align":"middle",
        item:{
          'font-size':"8px"
        }
      }, // Creates an interactive legend
      series: [  ]
    }
  }

}



function  getMainScenario(){
    let s = new Scenario("aukraheimen","Aukraheimen");

    s.name = "Aukraheimen";
    s.projectId = "aukraheimen";
    //s.log =  createEventLog();
    s.model = getAukraModellen();


    return s;
}


function createEventLog(){
  let log = [];

  for(let i=0; i<20; i++){
    let e = new EventLogItem();
      e.simTime = i*1000+2000;
      e.name  ="wakeup department A";
      e.message =`patient ${i} is walking`;
      e.logItems = [];
       for(let k=0; k<10; k++){
         let logItem = new LogItem();
         logItem.simTime = e.simTime + k*150+150;
         e.message=`nurse ${k} is helping patient ${i}`;
         e.logItems.push(e);
       }

       log.push(e);
  }



  return log;
}



function getStubModellen(){

  let m = new SimulationModel();

  m.data.code =getCommonStub();
  m.entities.code= getEntitiesStub();
  m.variables.code  = getVariablesStub();
  m.stations.code = getStationsStub();
  m.routes.code = getRoutesStub();
  m.settings.code  = getSettings();
  m.charts.code = getCharts();

return m;


}


function getAukraModellen(){

  let m = new SimulationModel();

  m.data.code =getCommon();
  m.entities.code= getEntities();
  m.variables.code  = getVariables();
  m.stations.code = getStations();
  m.routes.code = getRoutes();
  m.settings.code  =getSettings();
  m.charts.code = getCharts();

return m;


}





function getCharts(){
  return `
[
  { variable:"countMyEntities"},
  { variable:"countMyEntityPlannedEvents"},
  { variable:"countMyEntityRandomEvents"}
]`;



}

function createcharts(){
  let gs = [];

 let chartData = {
      type: "line",  // Specify your chart type here.
      title: {
        text: "My First Chart" // Adds a title to your chart
      },
      legend: {
        align:"right",
        "vertical-align":"middle",
        item:{
          'font-size':"8px"
        }
      }, // Creates an interactive legend
      series: [  // Insert your series data here.
          { values: [35, 42, 67, 89]},
          { values: [28, 40, 39, 36]}
      ]
    };
let chart={ // Render Method[3]
      id: "testc2",
      data: chartData,
      height: 300,
      width: "100%"
    };
let chart3={ // Render Method[3]
      id: "testc3",
      data: chartData,
      height: 300,
      width: "100%"
    }
let chart4={ // Render Method[3]
      id: "test4",
      data: chartData,
      height: 300,
      width: "100%"
    }
let chart5={ // Render Method[3]
      id: "test5",
      data: chartData,
      height: 300,
      width: "100%"
    }
let chart2={ // Render Method[3]
      id: "testc",
      data: chartData,
      height: 300,
      width: "100%"
    }

    gs.push(chart);
    gs.push(chart2);
    gs.push(chart3);
    gs.push(chart4);
    gs.push(chart5);


    return gs;


}

function getCommonStub(){
  return `
  this.data.partArrivalDist = {type:Distributions.Exponential, param1:5}
  this.data.machineProcessTime = {type:Distributions.Exponential, param1:3}`;



}


function getCommon(){

  return `

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
}

function getVariablesStub(){
  return ``;
}
function getVariables(){

  return `     

let variables                         = {}; //don't remove this line - declaration
variables.kpi                         = {}; //don't remove this line - declaration
variables.patientA                    = {}; //patient of type A variables
variables.nurses                      = {}; //variables for the nurses
variables.noLog                       = {}; //variables for the nurses

variables.noLog.currentShift                = 0;  // values 1,2 and 3. Initial value 0 means that there are no current shifts in the beginning
variables.noLog.nursesShiftA                = []; //will hold the current shift of nurses at dep A
variables.noLog.nursesShiftB                = []; //will hold the current shift of nurses at dep B
variables.noLog.nursesShiftC                = []; //will hold the current shift of nurses at dep C
variables.patientA.count              = 0;  //current number of Type A patients in system
variables.patientA.countInLine        = 0;  //current number of Type A patients in line
variables.patientA.countInBuilding    = 0;  //current number of Type A patients in Aukraheimen
variables.patientA.countDeaths        = 0;  //current number of dead Type A patients in system
variables.patientA.countDeathsInLine  = 0;  //current number of dead Type A patients in line
variables.kpi.nursesTotalWalkTime     = 0;  //total time nurses has spent walking
`;
}

function getStationsStub(){
  return `
[
  {name:"myStation"}
]`;
}

function getStations(){

    return `
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

}

function getSettings(){

  return  `
  {
        seed:1234,
        simTime:20000,
        useLogging:true
  }`;

}


function getRoutesStub(){
  return `
[
  {from:"myStation", to:"myStation"}
]`;
}


function getRoutes(){

  return`
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


}
function getEntities(){
  return `
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
           
           
                
                
              ctx.variables.noLog.nursesShiftA  = ctx.data.nurses.filter(nurse=>{
              
                      return nurse.floy==ctx.constants.floyA && nurse.shift==ctx.variables.noLog.currentShift;
                });
                
                ctx.variables.noLog.nursesShiftA.forEach(nurse=>{
                   
                    //walk from current station and out to external nurse station
                  ctx.sequenceTask()
                      .first(ctx.walk(nurse.currentStation,ctx.constants.baseA,nurse))
                      .then(ctx.walk(ctx.constants.baseA,ctx.constants.entrance,nurse))
                      .then(ctx.walk(ctx.constants.entrance,ctx.extNurseStation,nurse))
                      .run();
                });
                
                
                //Change the current shift
                ctx.variables.noLog.currentShift = 
                  ctx.variables.noLog.currentShift===3 ? 1 : ctx.variables.noLog.currentShift+1;
                
               
                 ctx.variables.noLog.nursesShiftA  = ctx.data.nurses.filter(nurse=>{
                      return nurse.floy==ctx.constants.floyA && nurse.shift==ctx.variables.noLog.currentShift;
                });
                
               
               
               
               ctx.variables.noLog.nursesShiftA.forEach(nurse=>{
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
}

function getEntitiesStub(){
  return `
[

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
}
