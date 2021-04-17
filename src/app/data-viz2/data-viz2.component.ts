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
            date: spElement["Effective date"],
            sp_price: spElement["S&P 500"],
            btc_price: btcElement[1]
          })
        }
      });
    });
  }

  private displayGraph(): void {
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#graph2")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(this.cherryPickDates, function(d) { return d3.timeParse("%Y-%m-%d")(d.date); }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([d3.min(this.cherryPickDates, function(d) { return +d.btc_price; }), d3.max(this.cherryPickDates, function(d) { return +d.btc_price; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(this.cherryPickDates)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d: any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
        .y(function(d: any) { return y(d.btc_price) })
        )
    svg.append("path")
      .datum(this.cherryPickDates)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d: any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
        .y(function(d: any) { return y(d.sp_price) })
        )
}


  async getFolder(): Promise<string> {
    return this.http.get<any>(`assets/data/sp500.json`).toPromise();
  }
}
