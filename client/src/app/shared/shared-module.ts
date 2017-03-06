import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {DocViewer} from './doc-viewer/doc-viewer';
import {ExampleViewer} from './example-viewer/example-viewer';
import {DocumentationItems} from './documentation-items/documentation-items';
import {NavBar} from './navbar/navbar';
import {Panel} from './panel/panel';
import {MaterialModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {PlunkerButton} from './plunker';
import {GuideItems} from './guide-items/guide-items';

@NgModule({
  imports: [
    HttpModule,
    RouterModule,
    BrowserModule,
    MaterialModule
  ],
  declarations: [DocViewer, ExampleViewer, NavBar, PlunkerButton,Panel],
  exports: [DocViewer, ExampleViewer, NavBar, PlunkerButton,Panel],
  providers: [DocumentationItems, GuideItems],
  entryComponents: [
    ExampleViewer,
  ],
})
export class SharedModule {}
