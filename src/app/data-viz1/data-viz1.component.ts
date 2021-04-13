import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-data-viz1',
  templateUrl: './data-viz1.component.html',
  styleUrls: ['./data-viz1.component.scss']
})
export class DataViz1Component implements OnInit {

  coinLists = {}

  constructor(private dataService: DataService) {
  }

  async ngOnInit(): Promise<void> {

    this.coinLists = await this.dataService.getProcessedDataViz1();
    console.log(this.coinLists);
    
    this.displayGraph();
  }

  private displayGraph(): void {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#graph1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          
    var root = d3.stratify()
      .id(function(d:any) { return d.coin; })
      .parentId(function(d:any) { return d.parent; })(this.coinLists['2014']['coins'])
    
    root.sum(function(d:any) { return d.market_cap })
    
    d3.treemap()
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
        .attr("x", function(d:any){ return d.x0+10})    // +10 to adjust position (more right)
        .attr("y", function(d:any){ return d.y0+20})    // +20 to adjust position (lower)
        .text(function(d:any){ return d.data.coin})
        .attr("font-size", "15px")
        .attr("fill", "white")
   
  }
}
