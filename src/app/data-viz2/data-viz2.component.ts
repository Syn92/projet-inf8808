import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-data-viz2',
  templateUrl: './data-viz2.component.html',
  styleUrls: ['./data-viz2.component.scss']
})
export class DataViz2Component implements OnInit {

  btcPrices = [];
  sp500 = []
  cherryPickDates = []
  constructor(private dataService: DataService, private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {
    this.getFolder().then(res => {
      this.sp500 = res as any;

    }).catch(async e => {
      console.log("sp500.json not found");

    }).finally(async () => {
      this.btcPrices = await this.dataService.getProcessedDataViz2();
      this.cherryPickDate(this.btcPrices, this.sp500)
      console.log("cherryPickedDates", this.cherryPickDates);
      this.displayGraph();
    });
  }
  
  private cherryPickDate(btcPrices: any[], sp500: any[]): void {
    btcPrices.forEach(btcElement=> {
      sp500.forEach(spElement => {
        if (btcElement[0] == spElement["Effective date"]) {
          this.cherryPickDates.push({
            date: new Date(spElement["Effective date"]),
            sp_price: spElement["S&P 500"],
            btc_price: btcElement[1]
          })
        }
      });
    });
  }

  private displayGraph(): void {
  }


  async getFolder(): Promise<string> {
    return this.http.get<any>(`assets/data/sp500.json`).toPromise();
  }
}
