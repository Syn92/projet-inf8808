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
  private yScale1;
  private yScale2;
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
    this.drawTotMC()
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
    const date: Date[] = []
    
    this.data.btcPrice.forEach(e => {
      date.push(e[0])
    })

    // setup scales

    this.xScale = d3.scaleTime()
      .domain(d3.extent(date, d => d))
      .range([0, this.width])
      .nice();
      
    const maxY1 = d3.max(this.data.global.map(d => parseInt(d[1])))
    const minY1 = d3.min(this.data.btcPrice.map(d => parseInt(d[1])))
  
    this.yScale1 = d3.scaleLog()
      .domain([minY1-this.offset, maxY1])
      .range([this.height, this.margin])

    const maxY2 = d3.max(this.data.btcDom.map(d => parseInt(d[1])))

    this.yScale2 = d3.scaleLinear()
      .domain([0, maxY2])
      .range([this.height, this.margin])

    // Append axies to svg

    this.svg.append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .attr('class', 'x axis')
      .call(d3.axisBottom(this.xScale))
    
    this.svg.append('g')
      .attr('class', 'y axis1')
      .call(d3.axisLeft(this.yScale1)
        .tickFormat(y => {
          return `${this.nFormatter(y, 0)}`
        }))

    this.svg.append('g')
      .attr('transform', `translate(${this.width}, 0)`)
      .attr('class', 'y axis2')
      .call(d3.axisRight(this.yScale2)
        .tickFormat(y => `${y}%`))
      
  }

  private drawBTC() {
    this.svg.append('path')
      .datum(this.data.btcPrice)
      .attr('fill', 'none')
      .attr('stroke', 'limegreen')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(d => this.xScale(d[0]))
        .y(d => this.yScale1(d[1]))
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
        .y(d => this.yScale2(d[1]))
      )
  }

  private drawTotMC() {
    // console.log(this.data.global)
    // console.log(this.data.btcPrice)
  }

  // Formats number ex: 10000 => 10K
  private nFormatter(num, digits) {
    var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "B" },
      { value: 1E12, symbol: "T" }
    ];
    var regex = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(regex, "$1") + si[i].symbol;
  }
}
