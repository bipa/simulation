import {Component, ViewEncapsulation,OnInit,AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import { LoaderService } from './spinner.service';


@Component({
  selector: 'material-docs-app',
  templateUrl: './material-docs-app.html',
  styleUrls: ['./material-docs-app.scss'],
  host: {
    '[class.docs-dark-theme]': 'isDarkTheme',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MaterialDocsApp implements OnInit   {
  isDarkTheme = true;
  showShadow = false;
  showLoader = true;
  loaderService :LoaderService;


  constructor(loaderService: LoaderService, router: Router) {

    this.loaderService = loaderService;
    router.events.subscribe(data => {
      this.showShadow = data.url.startsWith('/components');
    });
    
  }


   ngOnInit() {
         this.loaderService.status.subscribe((val: boolean) => {
                  this.showLoaderFunc(val);
       });
    }
    
  
  showLoaderFunc(val :boolean){
      this.showLoader=val;
  }
}
