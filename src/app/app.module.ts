import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'

import { AppComponent } from './app.component';
import { DataService } from './data-service.service';
import { TestD3Component } from './test-d3/test-d3.component';

@NgModule({
  declarations: [
    AppComponent,
    TestD3Component
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
