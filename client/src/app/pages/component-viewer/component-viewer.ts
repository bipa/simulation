import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentationItems, SimulationProject} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-component-viewer',
  templateUrl: './component-viewer.html',
  styleUrls: ['./component-viewer.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ComponentViewer {


  simulationProject: SimulationProject;
  projectId : string;
  projects:SimulationProject[];

  activeLinkIndex:number;

  activeTabIndex:number;


  tabLinks = [
    {label: 'SIMULERING', link: 'simulation'},
    {label: 'SCENARIOER', link: 'scenarioes'},
    {label: 'INNSTILLINGER', link: 'settings'},
  ];


  constructor(private _route: ActivatedRoute,
              private _componentPageTitle: ComponentPageTitle,
              public docItems: DocumentationItems) {
    _route.params.subscribe(p => {

            this.projectId = p['id'];

            this.getProject(this.projectId);
       });

        this.setActiveLinkIndex();
      

        _route.url.subscribe(url => {

        url.toString();

        
       });
  }


  async getProject(projectId){
     this.simulationProject = await this.docItems.getProject(projectId);
     this._componentPageTitle.title = `${this.simulationProject.name}`;
  }


  setActiveLinkIndex(){
       if(this._route.snapshot.children.length==1)
       {
         let segment = this._route.snapshot.children[0];
         if(segment.url.length==0) return;
         switch (segment.url[0].path) {
           case "scenarioes":
             this.activeLinkIndex = 1;
             break;
           case "simulation":
             this.activeLinkIndex = 0;
             break;
           case "settings":
             this.activeLinkIndex = 2;
             break;
         
           default:
             break;
         }
         
       }
  }
  
}
