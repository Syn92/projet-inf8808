import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';  
import { IData } from '../../assets/Interfaces';
import * as d3 from 'd3';

@Component({
  selector: 'app-data-viz3',
  templateUrl: './data-viz3.component.html',
  styleUrls: ['./data-viz3.component.scss']
})
export class DataViz3Component implements OnInit {
  
  private data: IData;
  private svg;
  private xScale;
  private yScale;
  private offset = 100;
  private margin = 50;
  private width = 1000 - (this.margin * 2);
  private height = 600 - (this.margin * 2);

  constructor(private dataService: DataService) { }

  public ngOnInit(): void {
    this.dataService.getProcessedData().then((res: IData) => {
      this.data = res
      this.displayGraph()
    });
  }

  private displayGraph() {
    this.setupBaseGraph();
    this.setupAxies();
    this.drawBTC();
    this.drawBTCDom()
  }
  
  private setupBaseGraph() {
    this.svg = d3.select('figure#graph')
      .append('svg')
      .attr('width', this.width + (this.margin * 2))
      .attr('height', this.height + (this.margin * 2))
      .append('g')
      .attr('transform', `translate(${this.margin}, ${this.margin})`);
  }

  private setupAxies() {
    const date: Date[] = this.data.btcPrice.map(d => d[0])

    this.xScale = d3.scaleTime()
      .domain(d3.extent(date, d => d))
      .range([0, this.width])
      .nice();
      
    const maxY = d3.max(this.data.global.map(d => parseInt(d.market_cap)))
    const minY = d3.min(this.data.btcPrice.map(d => parseInt(d[1])))
  
    this.yScale = d3.scaleLog()
      .domain([minY-this.offset, maxY])
      .range([this.height, this.margin])

    this.svg.append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .attr('class', 'x axis')
    
    this.svg.append('g')
      .attr('class', 'y axis')
      
    this.svg.select('.x.axis')
      .call(d3.axisBottom(this.xScale))
      
    this.svg.select('.y.axis')
      .call(d3.axisLeft(this.yScale))
  }

  private drawBTC() {
    this.svg.append('path')
      .datum(this.data.btcPrice)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(d => this.xScale(d[0]))
        .y(d => this.yScale(d[1]))
      )
  }

  private drawBTCDom() {

    this.svg.append('path')
      .datum(this.data.btcDom)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(d => this.xScale(d[0]))
        .y(d => this.yScale(d[1] * 1000))
      )
  }
}
