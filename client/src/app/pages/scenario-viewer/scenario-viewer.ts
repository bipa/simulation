import {ViewChild, ElementRef, AfterViewInit, Component, Input,OnInit,OnChanges } from '@angular/core';
import {DocumentationItems, SimulationProject, Chart,EmitterService,Scenario} from '../../shared/documentation-items/documentation-items';
import {  NgZone,  OnDestroy } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

declare var zingchart: any;

@Component({
  selector: 'scenario-viewer',
  templateUrl: './scenario-viewer.html',
  styleUrls: ['./scenario-viewer.scss']
})
export class ScenarioViewer  extends AfterViewInit implements OnInit, OnChanges  {
 
 

  @ViewChild('myTable') table: any;



projectId:string;
scenarioes:Scenario[] = [];
selectedScenario : Scenario;

charts=[];

simState : number = 0; //0 means stopped, 1 means halted, 2 means isrunning, 3 means done
simTime:number=0;
totalSimTime : number = 2*365*24*60; //two years
delay:number=1;
speed:number=100;

rows=[];
events=[];
minHeight = 450;



 constructor(
                private _route: ActivatedRoute,
                private zone: NgZone,
              public docItems: DocumentationItems) {
                super();
   _route.parent.params.subscribe(p => {

            this.getScenarioes(p);
    


        });

    
  }
ngOnInit(){

   
}

 async getScenarioes(p){
        
        
        this.projectId = p['id'];
        let scenarioes =await this.docItems.getScenarioes(this.projectId);
        scenarioes.forEach(scenario=>{
            if(scenario.isValid)
            {
                if(scenario.isSelected)
                {
                    this.selectedScenario = scenario;
                }
                this.scenarioes.push(scenario)
            }
            
        });


         this.getScenarioRows();
         this.initCharts();
         this.simState = 0;
     
    }



initCharts(){
    this.scenarioes.forEach(scenario=>{



         if(scenario.runtimeModel.charts)
         {
              scenario.runtimeModel.charts.forEach(chart=>{

                  //Check if the chart is already here
                  let isNew = false;
                  let newChart = this.charts.find(c=> {return c.variable===chart.variable});
                  if(!newChart)
                  {

                      newChart = this.docItems.defaultChart(chart.variable);
                      newChart.id  = chart.id || chart.variable;
                      isNew = true;
                  }

                   newChart.data.series.push({
                      text:scenario.name,
                      values:chart.startValue || [0],
                      key:scenario[`$key`]
                    });

              Object.assign(newChart,chart);
              //newChart.scenarioes.push(scenario);
              if(isNew){
                      this.charts.push(newChart);

              }
              });
         } 

      })
}


run(scenario){
  
  if(this.simState==0 || this.simState == 3|| this.simState == 4){
      //start a new simulation
      this.initRuntimes();
      this.simTime=0;
      this.simState = 2;

      this.simulate();

  }else if (this.simState==1){
      //continue a simulation
      this.simState = 2;
      this.simulate();
  }else{

  }




}


updateVariable(scenarioName, simulationRecord){

      let variableName = simulationRecord.name;
      let value = simulationRecord.value;

      let row = this.rows.find(r=>{ return r.name==variableName;})

      row[scenarioName] = value;

}


initRuntimes(){
   this.scenarioes.forEach(scenario=>{

      scenario.runtimeModel.logs = [];
      scenario.runtimeModel.currentIndex = 0;
      scenario.runtimeModel.currentLogIndex = 0;
      scenario.runtimeModel.countRecords  = scenario.runtimeModel.simulationRecords ? scenario.runtimeModel.simulationRecords.length : 0;
      scenario.runtimeModel.countLogRecords  = scenario.runtimeModel.logRecords? scenario.runtimeModel.logRecords.length : 0;
      this.updateNextRecord(scenario);
      this.updateNextLogRecord(scenario);

  });

  this.charts.forEach(chart=>{
    chart["sim-data"].nextTick+=chart["sim-data"].timeScale;
  })
}

updateNextLogRecord(scenario: Scenario){
       if(scenario.runtimeModel.currentLogIndex<scenario.runtimeModel.countLogRecords)
      {
            scenario.runtimeModel.nextLogRecord = 
            scenario.runtimeModel.logRecords[scenario.runtimeModel.currentLogIndex]; 
            scenario.runtimeModel.currentLogIndex++;
      }else{
        //no more recordsToUpdate
        scenario.runtimeModel.nextLogRecord = null;
      }
}

updateNextRecord(scenario: Scenario){
       if(scenario.runtimeModel.currentIndex<scenario.runtimeModel.countRecords)
      {
            scenario.runtimeModel.nextRecord = 
            scenario.runtimeModel.simulationRecords[scenario.runtimeModel.currentIndex]; 
            scenario.runtimeModel.currentIndex++;
      }else{
        //no more recordsToUpdate
        scenario.runtimeModel.nextRecord = null;
      }
}

updateNextLog(scenario : Scenario){
  
        if(scenario.runtimeModel.nextLogRecord && this.simTime>=scenario.runtimeModel.nextLogRecord.simTime){       
          scenario.runtimeModel.logs.push(scenario.runtimeModel.nextLogRecord)
          this.updateNextLogRecord(scenario);
        }
}

updateNextVariable(scenario : Scenario){
  
        if(scenario.runtimeModel.nextRecord && this.simTime>=scenario.runtimeModel.nextRecord.simtime){
          let variableRow  = this.rows.find(r=>{return r.name==scenario.runtimeModel.nextRecord.name });
          variableRow[scenario.name] = scenario.runtimeModel.nextRecord.value;
          this.updateNextRecord(scenario);
        }
}


updateCharts(){
      this.charts.forEach(chart=>{

          if(chart["sim-data"].nextTick <= this.simTime)
          {
            this.scenarioes.forEach(scenario=>{
                let series = chart.data.series.find(c=>{return c.key===scenario['$key']})
                if(series){

                let variableRow  = this.rows.find(r=>{return r.name===chart.variable });
                let value= variableRow[scenario.name]; 
                let plotIndex = chart.data.series.indexOf(series);

                zingchart.exec(chart.id, 'addnode', {
                    plotindex : plotIndex,
                    value : value
                });

               


                }
               
            });
           
           
            chart["sim-data"].nextTick+=chart["sim-data"].timeScale;
          }


      });
}


simulate(){
  this.scenarioes.forEach(s=>{
    
    
    this.updateNextVariable(s);
    this.updateNextLog(s);
    
  });

  this.updateCharts();


  if(this.simTime<=this.totalSimTime)
  {
        setTimeout(()=>{

        //update simtime increases by 100
        this.simTime+=this.speed;
        

      if(this.simState==2)
      {
          this.simulate();
      }
        


      },this.delay)

  }
  else{
    //done
    this.simState =3;
  }

  


}









pause(scenario){
  this.simState=1;
}
stop(scenario){
  this.simState = 4;
}


runSimulation(){
 
}







ngOnChanges() {
        // Listen to the 'edit'emitted event so as populate the model
        // with the event payload
      
    }




ngAfterViewInit() {


      //this.simulation.selectedScenario.model.charts[0]=this.chart;
  //zingchart.render(this.simulation.selectedScenario.model.charts[0]);
    /*this.zone.runOutsideAngular(


      () =>{
       

        if(this.selectedScenario)
        this.selectedScenario.runtimeModel.charts.forEach(
          c=>{zingchart.render(c)}
          );
         


      }
  
  );*/


  
  }


onSelectedScenarioChanged(scenario){
    
    
  //create logs

  //create graphs



}




   
  closeScenario(scenario){
    scenario.isClosed = true;
    //Add to a list 
  }

    showCollapseButton : false;

  
  closeScenarioResults(scenario){
    scenario.isResultsClosed = true;
    //Add to a list 
  }


closePanel(name:string){

}

drag(){

}




  expanded: any = {};
  //timeout: any;

  

  /*onPage(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log('paged!', event);
    }, 100);
  }

  fetch(cb) {
    let req = new XMLHttpRequest();
    req.open('GET', `assets/data/100k.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }*/

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }




getScenarioRows(){



  /*for(let i=0;i<this.simulation.)

  this.simulation.scenarioes.forEach(
    (scenario)=>{
      let row = {name:scenario.name};
      scenario.variables.forEach(
        (variable)=>{
          
        }
      )
    }
  )*/

  //first go through all variables from all VALID scenarioes
  let map = new Map();

  this.scenarioes.forEach(
      (scenario)=>{

        if(!scenario.isValid) return;

        if(!map.has("Mål")){
          let kpiRow = {name:"Mål"};
          map.set("Mål",kpiRow);
        }
       
        //Always kpis first

        for(let variableName in scenario.runtimeModel.variables.kpi) 
        {

             if(!map.has(variableName)){
                    let variableRow = {};
                  variableRow["name"] = variableName;
                  map.set(variableName,variableRow);
        }

        

        }


        //All others

        for(let variableName in scenario.runtimeModel.variables) 
        {
          if(variableName!=="kpi"){
            
                  

               if(!map.has(variableName)){
                   let catRow = {name :variableName};
                    map.set(variableName,catRow);
                }





          }


        }



  });


for(let  row  of Array.from(map.values())){
    this.scenarioes.forEach(scenario=>{

        if(!scenario.isValid) return;

        row[scenario.name] = 0;

    });
}
  

  /*for(let i=0;i<10;++i){

    let row = {name:"variabel"+i}

    for(let j=0;j<10;++j){
        let propName = "Scenario"+j;
        row[propName] = 0;
    }

    
    rows.push(row);
  }*/

this.rows.length=0;
Array.from(map.values()).forEach(v=>{
        this.rows.push(v);
});
        //this.rows = Array.from(map.values());
}


getRowValue(row,scenario)
{
  return row[scenario.name];
}











}



@Component({
  selector: 'zingchart',
  inputs: ['chart'],
  template: `<div [style.width]="chart.width" ><div  id="{{chart.id}}"></div></div>`
})
export class ZingChart implements AfterViewInit, OnDestroy {
 @Input() chart: Chart
  
  

  constructor (private zone: NgZone) { }
  
  ngAfterViewInit () {

    this.zone.runOutsideAngular(
      () => zingchart.render(this.chart)
  
  );
  }
  
  ngOnDestroy () {
    zingchart.exec(this.chart.id, 'destroy');
  }
}


