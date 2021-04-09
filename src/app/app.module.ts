import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {MatToolbarModule} from '@angular/material/toolbar';

import { AppComponent } from './app.component';
import { DataService } from './data-service.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataViz1Component } from './data-viz1/data-viz1.component';
import { DataViz2Component } from './data-viz2/data-viz2.component';
import { DataViz3Component } from './data-viz3/data-viz3.component';

@NgModule({
  declarations: [
    AppComponent,
    DataViz1Component,
    DataViz2Component,
    DataViz3Component
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
