import {Component, Input} from '@angular/core';
import {DocumentationItems, SimulationProject} from '../../shared/documentation-items/documentation-items';
import { Router } from "@angular/router";



@Component({
  selector: 'settings-viewer',
  templateUrl: './settings-viewer.html',
  styleUrls: ['./settings-viewer.scss']
})
export class SettingsViewer {
 

   @Input()  simulation: SimulationProject;

 constructor(private router: Router,
              public docItems: DocumentationItems) {
    
  }

   deleteProject(){
     this.docItems.removeItem(this.simulation);
     this.router.navigate(['components']);
   };


}
