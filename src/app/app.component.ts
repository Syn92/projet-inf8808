import { Component, OnInit } from '@angular/core';
import { DataService } from './data-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Projet8808';
  
  constructor(private dataService: DataService){}
  ngOnInit() {
    this.dataService.retrieveData();
  }
}
