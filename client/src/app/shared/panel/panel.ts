import {Component, Input, ViewEncapsulation} from '@angular/core';
import {DocumentationItems, ISimulationModel} from '../../shared/documentation-items/documentation-items';



@Component({
  selector: 'model-panel',
  templateUrl: './panel.html',
  styleUrls: ['./panel.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Panel {
   @Input()  title: string;

   @Input() minHeight:string;

   @Input() isCollapsed: boolean = false;

   @Input() showCollapseButton: boolean = false;

   flexGrow:number = 1;

  toggleIsCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
    this.flexGrow = (this.flexGrow +1) % 2;
  }

}
