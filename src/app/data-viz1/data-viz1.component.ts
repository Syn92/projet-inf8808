import { Component, OnInit } from '@angular/core';
import { IData, IDataMarketGlobal } from '../../assets/Interfaces';
import { DataService } from '../data-service.service';

@Component({
  selector: 'app-data-viz1',
  templateUrl: './data-viz1.component.html',
  styleUrls: ['./data-viz1.component.scss']
})
export class DataViz1Component implements OnInit {

  private data: IData;
  private global: IDataMarketGlobal[];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getProcessedData().then((res: IData) => {
      this.data = res
      this.global = res.global

      console.log(this.global)
    });
  }
}
