import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';  
import { IData } from '../../assets/Interfaces';
import * as d3Legend from '../../assets/d3-svg-legend'
import * as d3 from 'd3';

@Component({
  selector: 'app-data-viz3',
  templateUrl: './data-viz3.component.html',
  styleUrls: ['./data-viz3.component.scss']
})
export class DataViz3Component implements OnInit {
  
  private data: IData;
  private container;
  private svg;
  private xScale;
  private yScale1;
  private yScale2;
  private offset = 100;
  private margin = 50;
  private containerWidth = 1500;
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
    this.drawVol()
    this.drawBTC();
    this.drawBTCDom()
    this.drawTotMC()
    this.drawLegend()
    this.drawTrend()
  }
  
  private setupBaseGraph() {
    this.container = d3.select('figure#graph')
      .append('svg')
      .attr('class', 'container')
      .attr('width', this.containerWidth)
      .attr('height', this.height + (this.margin * 2))
      
    this.svg = this.container.append('svg')
      .append('g')
      .attr('width', this.width + (this.margin * 2))
      .attr('height', this.height + (this.margin * 2))
      .attr('transform', `translate(${this.containerWidth/2 - this.width/2}, ${this.margin})`);

    console.log(this.svg)
  }

  private setupAxies() {
    const date: Date[] = []
    
    this.data.btcPrice.forEach(e => {
      date.push(e[0])
    })


    const ext = d3.extent(date, d => d)
    // setup scales
    this.xScale = d3.scaleTime()
      .domain([ext[0].setDate(ext[0].getDate() - 1), ext[1].setDate(ext[1].getDate() + 25)])
      .range([0, this.width])
      
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
      .attr('stroke', 'indigo')
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
      .attr('stroke-width', 1)
      .attr('d', d3.line()
        .x(d => this.xScale(d[0]))
        .y(d => this.yScale2(d[1]))
      )
  }

  private drawTotMC() {

    this.svg.append('path')
      .datum(this.data.global)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(d => this.xScale(d[0]))
        .y(d => this.yScale1(d[1]))
      )
  }

  private drawVol() {
    // Bar Chart of 2 month avg
    let isSmaller = false;
    this.svg.selectAll('.bar')
      .data(this.data.volume['average'])
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => this.xScale(d[0]) - 5)
      .attr('y', d => this.yScale1(d[1]))
      .attr('width', 10)
      .attr('height', d => this.height - this.yScale1(d[1]))
      .style('fill', (d, i ,e) => {
        if (i === 0)
          return 'green'
          
        return e[i-1].__data__[1] < d[1] ? 'green' : 'red'
      })
      .style('opacity', 0.35)
      .style('stroke-width', 0.5)

    //uncomment to see line of detailed volume
    // this.svg.append('path')
    //   .datum(this.data.volume['detailed'])
    //   .attr('fill', 'none')
    //   .attr('stroke', 'green')
    //   .attr('stroke-width', 1.5)
    //   .attr('d', d3.line()
    //     .x(d => this.xScale(d[0]))
    //     .y(d => this.yScale1(d[1]))
    //   )
  }

  private drawTrend() {
    console.log(this.data.trend)
    this.svg.append('path')
      .datum(this.data.trend)
      .attr('fill', 'none')
      .attr('stroke', 'deeppink')
      .attr('stroke-width', 1.5)
      .attr('d', d3.line()
        .x(d => this.xScale(d['timestamp']))
        .y(d => this.yScale2(d['value']))
      )
  }
  
  private drawLegend() {
    const scaleLeft = d3.scaleOrdinal()
                    .domain(['Capitalisation totale des cryptomonnaies','Valeur du Bitcoin', `Volume d'échange (incrémenté)`, `Volume d'échange (décrémenté)`])
                    .range(['rgb(70, 130, 180)','#4B0082', 'rgb(166, 211, 166)', 'rgb(255, 166, 166)'])
    
    const scaleRight  = d3.scaleOrdinal()
                    .domain(['Dominance du bitcoin', `'Bitcoin' sur google trend US`])
                    .range(['rgb(255, 165, 0)', 'rgb(255, 20, 147)'])

    const legendLeft = d3Legend.legendColor()
                           .title('Axe Gauche')
                           .shapeHeight(5)
                           .shapeWidth(20)
                           .shapePadding(5)
                           .labelWrap(150)
                           .scale(scaleLeft)

    const legendRight = d3Legend.legendColor()
                           .title('Axe Droite')
                           .shapeHeight(5)
                           .shapeWidth(20)
                           .shapePadding(5)
                           .labelWrap(150)
                           .scale(scaleRight)

    this.container.append('g')
      .attr('class', 'legend')
      .attr('transform',  `translate(70, 100) `)
      .call(legendLeft)

    this.container.append('g')
      .attr('class', 'legend')
      .attr('transform',  `translate(${this.containerWidth/2 + this.width/2 + 80}, 100) `)
      .call(legendRight)
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
