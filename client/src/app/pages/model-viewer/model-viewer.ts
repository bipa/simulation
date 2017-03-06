import {Component, Input, ViewEncapsulation,OnInit} from '@angular/core';
import {DocumentationItems,Action, SimulationModel, SimulationProject,Scenario,ScenarioError, EmitterService } from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {MdDialog, MdDialogRef} from '@angular/material';
import {Observable} from 'rxjs/Rx';
import {ActivatedRoute} from '@angular/router';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';




@Component({
  selector: 'model-viewer',
  templateUrl: './model-viewer.html',
  styleUrls: ['./model-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModelViewer implements OnInit{
   

    projectId:string;
    scenarioes:Scenario[] = [];
    selectedScenario : Scenario;

    selectedCodeOriginal:string;
    buffer:string= null;
    code:string=null;
    showProgressBar:boolean = false;
    showDrawer: boolean;
    codeOptions=[
            {isSelected:false,name:"data",    display:"Data"},
            {isSelected:false,name:"variables",display:"Variabler"},
            {isSelected:false,name:"entities",display:"Entiteter"},
            {isSelected:false,name:"stations",display:"Stasjoner"},
            {isSelected:false,name:"routes",  display:"Ruter"},
            {isSelected:false,name:"charts",  display:"Grafer"},
            {isSelected:false,name:"settings",display:"Preferanser"},
        ];
    
    selectedCodeOption= this.codeOptions[0];

    showCollapseButton : false;
 
    options:any = {maxLines: 10000, printMargin: false, wrap:true};
    action : Action;


   constructor(
                private _route: ActivatedRoute,
                private docItems: DocumentationItems,
                private  af:AngularFire,
                private dialog: MdDialog
    )
    {
        _route.parent.params.subscribe(p => {

            this.getScenarioes(p);
    


        });

    }



   
    async getScenarioes(p){
        
        this.selectedCodeOption = this.codeOptions[0];
        this.selectedCodeOption.isSelected = true;
        this.projectId = p['id'];
        let scenarioes =await this.docItems.getScenarioes(this.projectId);
        scenarioes.forEach(scenario=>{
            this.scenarioes.push(scenario)
            if(scenario.isSelected)
            {
                this.selectedScenario = scenario;
            }
        });
     
    }



   async ngOnInit(){
       
    }






onSelectedScenarioChanged(scenario){
    
    //Save the text to the old code

    if(this.buffer!==null)
    {
        this.selectedScenario.model[this.selectedCodeOption.name].code  = this.buffer;
    }

    // set the new code text
  this.buffer = null;
  this.code = scenario.model[this.selectedCodeOption.name].code;
   
   //notice there should be no trigging of on selectedCodeOption event
}


closeDrawer(){
    this.showDrawer = false;
}

 async  send(){

       if(this.buffer!==null)
        {
            this.selectedScenario.model[this.selectedCodeOption.name].code  = this.buffer;
        }
        //this.buffer= null;

        let commentOperation:Observable<any>;
        let compileModel = {
               name:this.selectedScenario.name,
               model:this.selectedScenario.model
           };

        try{
            let response = await this.docItems.saveModel(compileModel);
            this.showProgressBar = true;
            let saveModel;
            this.action = Action.Save;
            if(response.hasError)
            {

                this.selectedScenario.isValid = false;
                this.selectedScenario.runtimeModel=null;
                this.selectedScenario.error = 
                    new ScenarioError(response.error.type,response.error.message);
            }else{
                this.selectedScenario.isValid = true;
                this.selectedScenario.error = null;
                this.selectedScenario.runtimeModel=response.scenario.runtimeModel
            }


            saveModel = {
                    runtimeModel:this.selectedScenario.runtimeModel,
                    model:this.selectedScenario.model,
                    error:this.selectedScenario.error,
                    isValid : this.selectedScenario.isValid    
            }
            
            try {
                await this.docItems.updateScenario(this.selectedScenario,saveModel);
                this.removeAsterix();
                this.showProgressBar = false;
        
            } catch (error) {
                    this.showProgressBar = false;
                    throw error;
            }

           
        }   
        catch(err) {
            console.log(err);
        }
        

                        
                   
   }

   removeAsterix(){
        for(let propName in this.selectedScenario.model)
        {
            this.selectedScenario.model[propName].isDirty=false;
        }
        
        this.codeOptions.forEach(o=>{
            if(o.display.includes("*"))
            {
               o.display=   o.display.
                            substring(0, o.display.length - 1);
            }
        });
        this.selectedScenario.isDirty = false;
        this.selectedScenario.asterix="";
   }

    
onSelectedCodeOption(codeOption){

    //save the old code text
  
     if(this.buffer!==null)
    {
        this.selectedScenario.model[this.selectedCodeOption.name].code  = this.buffer;
    }

    this.selectedCodeOption.isSelected = false;
    codeOption.isSelected = true;
    this.selectedCodeOption = codeOption;

    // set the new code text
   this.buffer = null;
   this.code = this.selectedScenario.model[this.selectedCodeOption.name].code;

}

    onTextChanged(text) {
        
        if(this.buffer==null)
        {
            this.buffer = text;
        }
        else if(this.buffer!=text){ 

            this.selectedScenario.model[this.selectedCodeOption.name].isDirty=true;
            if(!this.selectedCodeOption.display.includes("*"))
                this.selectedCodeOption.display +="*";
            this.selectedScenario.asterix="*";
            this.selectedScenario.isDirty = this.isScenarioDirty();
     
            this.buffer = text;

        }
        else{
            
            this.selectedScenario.model[this.selectedCodeOption.name].isDirty=false;
            this.selectedCodeOption.display =this.selectedCodeOption.display.
                                                substring(0, this.selectedCodeOption.display.length - 1)
            this.selectedScenario.isDirty = this.isScenarioDirty();
        }
       
    }


isScenarioDirty(){
    
    for(let modelItemPropertyName in this.selectedScenario.model){
        if(this.selectedScenario.model[modelItemPropertyName].isDirty)
        {
            return true;
        }
    }
}

async deleteSelectedScenario(){
   
   let path = `/scenarioes/${this.selectedScenario["$key"]}`;
   let o =  this.af.database.object(path);

   await this.docItems.deleteScenario(this.selectedScenario);
   let i = this.scenarioes.indexOf(this.selectedScenario);
   this.scenarioes.splice(i,1);
   if(this.scenarioes.length>0)
   {
       this.selectedScenario = this.scenarioes[this.scenarioes.length-1];
   }
   else{
       this.selectedScenario = null;
   }
   this.buffer = null;

}

newScenario() {
    let dialogRef = this.dialog.open(NewScenarioDialog);
    dialogRef.afterClosed().subscribe(async newScenarioName => {


    if(!newScenarioName) return;

        let newScenario = new Scenario(this.projectId,newScenarioName);

        
        if(this.selectedScenario) this.selectedScenario.isSelected  = false;


        if(this.buffer!=null)this.selectedScenario.model[this.selectedCodeOption.name].code = this.buffer;
        this.buffer = null;

      if(this.selectedScenario){
            newScenario.model.data.code =       this.selectedScenario.model.data.code;
            newScenario.model.variables.code =  this.selectedScenario.model.variables.code;
            newScenario.model.entities.code =   this.selectedScenario.model.entities.code;
            newScenario.model.stations.code =   this.selectedScenario.model.stations.code;
            newScenario.model.routes.code =     this.selectedScenario.model.routes.code;
            newScenario.model.settings.code =   this.selectedScenario.model.settings.code;
    
      }
        newScenario.isSelected = true;
        this.action = Action.New;

        let scenario = await this.docItems.newScenario(newScenario);
        this.scenarioes.push(scenario); 
        this.selectedScenario = scenario;

    });
  }




}

@Component({
  selector: 'new-scenario-dialog',
  templateUrl: './model-new-scenario-dialog.html',
})
export class NewScenarioDialog {


  newScenarioName : string;

  constructor(public docItems: DocumentationItems,
              public dialogRef: MdDialogRef<NewScenarioDialog>) {




  }
}










/*deleteQuery(scenarioes){

    this.scenarioes.forEach(scenario=>{
        let s = this.scenarioes.find(v=> {return v.$key == scenario.$key } );

        if(!s){

            let i = this.scenarioes.indexOf(s);
            this.scenarioes.splice(i,1);
        }
    });
}


newQuery(scenarioes){

    scenarioes.forEach(scenario=>{
        let s = this.scenarioes.find(v=> {return v.$key == scenario.$key } );

        if(!s){
            this.scenarioes.push(s);
        }
    });
}

initialQuery(scenarioes){
       if(scenarioes.length>0){
                this.scenarioes.length = 0;
                scenarioes.forEach(s=>{
                    this.scenarioes.push(s);
                    if(s.isSelected)
                    {
                            this.selectedScenario = s;
                            this.selectedCodeOption.isSelected = true;
                    }

                    
                })
            }
}*/



           
           
                
           /* switch (this.action) {
                case Action.Initial:
                    this.action = Action.None;
                    this.initialQuery(scenarioes);
                    break;
                
                case Action.New:
                    this.action = Action.None;
                    this.newQuery(scenarioes);

                case Action.Delete:
                    this.action = Action.None;
                    this.deleteQuery(scenarioes);
                break;
                default:
                    break;
            }*/



        /*this.scenarioesObservable..forEach(s=>{

            s.forEach(scenario=>{this.scenarioes.push(scenario)});
            if(this.scenarioes.length>0)
                this.selectedScenario = this.scenarioes[0];


        });*/
      