import {BrowserModule} from '@angular/platform-browser';
import {NgModule,NO_ERRORS_SCHEMA} from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {MaterialDocsApp} from './material-docs-app';
import {Homepage} from './pages/homepage/homepage';
import {routing} from './routes';
import {ComponentList} from './pages/component-list/component-list';
import {NewProjectDialog} from './pages/component-list/component-list';
import {NewScenarioDialog} from './pages/model-viewer';
import {ComponentViewer} from './pages/component-viewer/component-viewer';
import {GuideList} from './pages/guide-list';
import {GuideViewer} from './pages/guide-viewer';
import {ModelViewer} from './pages/model-viewer';
import {ScenarioViewer} from './pages/scenario-viewer';
import { ZingChart } from './pages/scenario-viewer';
import {SettingsViewer} from './pages/settings-viewer';
import {ExampleModule} from './examples/example-module';
import {SharedModule} from './shared/shared-module';
import {ComponentCategoryList} from './pages/component-category-list/component-category-list';
import {ComponentSidenav} from './pages/component-sidenav/component-sidenav';
import {Footer} from './shared/footer/footer';
import {ComponentPageTitle} from './pages/page-title/page-title';
import {ComponentPageHeader} from './pages/component-page-header/component-page-header';
import { AceEditorComponent,AceEditorDirective  } from 'ng2-ace-editor'; 
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {AngularFireModule} from 'angularfire2';
import {firebaseConfig} from './../environments/firebase.config';
import 'hammerjs';
import {LoaderService} from './spinner.service';

 

@NgModule({
  declarations: [
    MaterialDocsApp,
    ComponentCategoryList,
    ComponentList,
    ComponentSidenav,
    ComponentViewer,
    NewProjectDialog,
    NewScenarioDialog,
    ComponentPageHeader,
    ZingChart,
    GuideList,
    GuideViewer,
    ModelViewer,
    SettingsViewer,
    ScenarioViewer,
    Homepage,
    Footer,
    AceEditorComponent,
    AceEditorDirective,
  ],
  imports: [
    NgxDatatableModule,
    BrowserModule,
    ExampleModule,
    SharedModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    FlexLayoutModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    routing, 
  ],
  entryComponents:[
    NewScenarioDialog,
    NewProjectDialog
  ],
  providers: [
    Location,
    ComponentPageTitle,
    LoaderService,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
  ],
  bootstrap: [MaterialDocsApp],
  schemas:[NO_ERRORS_SCHEMA]
})
export class AppModule {}
