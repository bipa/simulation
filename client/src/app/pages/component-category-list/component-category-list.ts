import {Component,OnInit} from '@angular/core';
import {DocumentationItems} from '../../shared/documentation-items/documentation-items';
import {ComponentPageTitle} from '../page-title/page-title';
import {AngularFire,FirebaseListObservable} from 'angularfire2';
import { LoaderService } from '../../spinner.service';


@Component({
  selector: 'app-component-category-list',
  templateUrl: './component-category-list.html',
  styleUrls: ['./component-category-list.scss']
})
export class ComponentCategoryList implements OnInit {
  constructor(public docItems: DocumentationItems,
              private _componentPageTitle: ComponentPageTitle,
              private af:AngularFire,
              private loaderService: LoaderService) {}

  categories:FirebaseListObservable<any>;

  ngOnInit() {
    
        this.loaderService.showSpinner = true;
        this.categories = this.af.database.list("/categories");
        this.loaderService.showSpinner = false;

  }
}
