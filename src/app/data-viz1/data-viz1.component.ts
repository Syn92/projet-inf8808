import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-data-viz1',
  templateUrl: './data-viz1.component.html',
  styleUrls: ['./data-viz1.component.scss']
})
export class DataViz1Component implements OnInit {

  displaySpinner = true;
  coinLists = {}

  constructor(private dataService: DataService, private http: HttpClient) {
  }

  async ngOnInit(): Promise<void> {

    this.getFolder().then(res => {
      this.coinLists = res;

    }).catch(async e => {
      console.log("dataviz1.json not found");
      this.coinLists = await this.dataService.getProcessedDataViz1();

    }).finally(() => {
      this.displaySpinner = false;
      console.log(this.coinLists);
      this.displayGraph();

    });

  }

  private displayGraph(): void {
    this.createSVG('#graph1a', '2014')
    this.createSVG('#graph1b', '2018')
    this.createSVG('#graph1c', '2021')
  }

  private createSVG(id: string, year: string) {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    var svg = d3.select(id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          
    var root = d3.stratify()
      .id(function(d:any) { return d.coin; })
      .parentId(function(d:any) { return d.parent; })(this.coinLists[year]['coins'])
    
    root.sum(function(d:any) { return d.market_cap })
    
    d3.treemap()
      .tile(d3.treemapSquarify.ratio(1))
      .size([width, height])
      .padding(4)
      (root)

    svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
        .attr('x', function (d:any) { return d.x0; })
        .attr('y', function (d:any) { return d.y0; })
        .attr('width', function (d:any) { return d.x1 - d.x0; })
        .attr('height', function (d:any) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", "#69b3a2");
    svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
        .attr("x", function(d:any){ 
          const length = d.data.coin.length / 2
          return ((d.x0 + d.x1) / 2) - (40 * length * (d.x1 - d.x0) / width) - 1
        })
        .attr("y", function(d:any){ 
          return ((d.y0 + d.y1) / 2) + 2
        })
        .text(function(d:any){ return d.data.coin})
        .attr("font-size", function(d:any){ 
          return String((100 * (d.x1 - d.x0) / width)) + "px"
        }) 
        .attr("fill", "white")
  }

  async getFolder(): Promise<string> {
    return this.http.get<any>(`assets/data/dataviz1.json`).toPromise();
  }
}
