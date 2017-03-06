import {Component} from '@angular/core';
import { DocumentationItems, SimulationCategory, SimulationProject, Scenario} from '../../shared/documentation-items/documentation-items';
import {ActivatedRoute} from '@angular/router';
import {ComponentPageTitle} from '../page-title/page-title';
import {MdDialog, MdDialogRef} from '@angular/material';

@Component({
  selector: 'app-components',
  templateUrl: './component-list.html',
  styleUrls: ['./component-list.scss']
})
export class ComponentList {
  categoryId: string;
  projects : SimulationProject[] = []; 


  constructor(public docItems: DocumentationItems,
              private _componentPageTitle: ComponentPageTitle,
              private _route: ActivatedRoute,
              public dialog: MdDialog) {
    _route.params.subscribe(  p => {

     this.categoryId = p['id'];
      this.getProjects(this.categoryId);
      

      this._componentPageTitle.title = p['id'] + ' prosjekter';
    });
  }



 async getProjects(categoryId:string){
      let projects = await this.docItems.getProjects(categoryId)
      projects.forEach(project=>{
        this.projects.push(project);
      })
  }

openDialog() {
    let dialogRef = this.dialog.open(NewProjectDialog);
    dialogRef.afterClosed().subscribe(project => {

      if(project){
        /*this.docItems.addNewItem(this.category.id,result);*/
        project.categoryId=this.categoryId;
        project.name= project.name.toLowerCase();
        this.projects.push(project);
      }

    });
  }




}



@Component({
  selector: 'dialog-result-example-dialog',
  templateUrl: './component-list-new-project-dialog.html',
})
export class NewProjectDialog {

  newItem : SimulationProject;

  constructor(public docItems: DocumentationItems,
              public dialogRef: MdDialogRef<NewProjectDialog>) {


                this.newItem = new SimulationProject();


  }
}