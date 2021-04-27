import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';  
import { IData } from '../../assets/Interfaces';
import * as d3Legend from '../../assets/d3-svg-legend'
import * as d3 from 'd3';
import {nest} from 'd3-collection'

@Component({
  selector: 'app-data-viz3',
  templateUrl: './data-viz3.component.html',
  styleUrls: ['./data-viz3.component.scss']
})
export class DataViz3Component implements OnInit {

  private readonly RIGHT_AXIS = ['btcDom', 'trend']
  private readonly LEFT_AXIS = ['global', 'volume', 'btcPrice']
  
  private data: any;
  public tooltip: any;
  private container;
  private svg;
  private xScale;
  private yScale1;
  private yScale2;
  private colors
  private offset = 100;
  private margin = 50;
  private containerWidth = 1500;
  private width = 1000 - (this.margin * 2);
  private height = 600 - (this.margin * 2);

  public showBtc: boolean = true;
  public showBtcDom: boolean = true;
  public showTrend: boolean = true;
  public showVol: boolean = true;
  public showTotal: boolean = true;

  public btc: any;
  public btcDom: any;
  public trend: any;
  public vol: any;
  public total: any;
  
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
    this.drawLegend()
    this.test(this)
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
  }

  private setupAxies() {
    const date: Date[] = []
    this.data[0].values.forEach(e => {
      date.push(e[0])
    })


    const ext = d3.extent(date, d => d)
    // setup scales
    this.xScale = d3.scaleTime()
      .domain([ext[0].setDate(ext[0].getDate() - 1), ext[1].setDate(ext[1].getDate() + 25)])
      .range([0, this.width])
      
    const maxY1 = parseInt(d3.max(this.data[0].values.map(d => d[1])))
    const minY1 = parseInt(d3.min(this.data[2].values.map(d => d[1])))
  
    this.yScale1 = d3.scaleLog()
      .domain([minY1-this.offset, maxY1])
      .range([this.height, this.margin])

    this.yScale2 = d3.scaleLinear()
      .domain([0, 100])
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

  private drawVol() {
    // Bar Chart of 2 month avg
    let isSmaller = false;
    this.vol = this.svg.selectAll('.bar')
      .data(this.data[1].values.average)
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

  public onToggle(obj: any, show: boolean){
      obj.style("visibility", show ? "visible" : "hidden")
  }

  private test(comp: DataViz3Component) {
    comp.colors = d3.scaleOrdinal()
      .domain(this.LEFT_AXIS.concat(this.RIGHT_AXIS))
      .range(['#4682B4', 'vol', '#4B0082', '#FFA500', '#FF1493'])

    var lineLeft = d3.line()
      .x(d => this.xScale(d[0]))
      .y(d => this.yScale1(d[1]))

    var lineRight = d3.line()
      .x(d => this.xScale(d[0]))
      .y(d => this.yScale2(d[1]))

    var lineGroup = this.svg.append('g')
      .attr('class', 'lines')
      .selectAll('.line-group')
      .data(this.data).enter()
      .append('g')
      .attr('class', 'line-group')

    lineGroup.append('path')
      .attr('class', 'line')
      .attr('d', d => {
        return this.LEFT_AXIS.includes(d.type) ? lineLeft(d.values) : lineRight(d.values)
      })
      .style('stroke', (d) => comp.colors(d.type))
      .style('stroke-weight', 1.5)
      .style('fill', 'none')

    comp.tooltip = d3.select("#graph").append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', '#D3D3D3')
      .style('padding', 6)
      .style('display', 'none')

    var mouseGroup = this.svg.append('g')
      .attr('class', 'mouse-over-effects')

    mouseGroup.append('path')
      .attr('class', 'mouse-line')
      .style('stroke', '#A9A9A9')
      .style("stroke-width", 2)
      .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseGroup.selectAll('.mouse-per-line')
      .data(this.data)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mouseGroup.append('svg:rect')
      .attr('width', this.width) 
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
        d3.selectAll("#tooltip")
          .style('display', 'none')

      })
      .on('mouseover', function () { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll("#tooltip")
          .style('display', 'block')
      })
      .on('mousemove', function (event: MouseEvent) { // update tooltip content, line, circles and text when mouse moves
        var mouse = d3.pointer(event)

        d3.selectAll(".mouse-per-line")
          .attr("transform", (d, i) => {

            if (d['type'] == 'volume')
              return ''

            var xDate = comp.xScale.invert(mouse[0])
            var bisect = d3.bisector(d => d[0]).left 
            var idx = bisect(d["values"], xDate);


            // console.log(d['values'][idx])

            // return ''
            d3.select(".mouse-line")
              .attr("d", function () {
                var data = "M" + comp.xScale(d['values'][idx][0]) + "," + 500;
                data += " " + comp.xScale(d['values'][idx][0]) + "," + 0;
                return data;
              });

            const x = comp.xScale(d['values'][idx][0])
            const y = comp.LEFT_AXIS.includes(d['type']) ? comp.yScale1(d['values'][idx][1]) : comp.yScale2(d['values'][idx][1])
            return `translate(${x}, ${y})`;
          });

        comp.updateTooltipContent(mouse, comp.data, comp, event)

      })
  }

  private updateTooltipContent(mouse, data, comp: DataViz3Component, mouseEvent: MouseEvent) {

    var mouseValues = []
    data.map(d => {
      if (d['type'] == 'volume')
        return ''

      var xDate = comp.xScale.invert(mouse[0])
      var bisect = d3.bisector(d => d[0]).left
      var idx = bisect(d.values, xDate)
      mouseValues.push({key: d.type, date: d.values[idx][0], price: d.values[idx][1]})
    })

    var sortingArr = mouseValues.map(d=> d.key)

    comp.tooltip.html(`${mouseValues[0].date.getFullYear()}-${mouseValues[0].date.getMonth() + 1}-${mouseValues[0].date.getDay()}`)
      .style('display', 'block')
      .style('font-size', 11.5)
      .selectAll()
      .data(mouseValues).enter() // for each vehicle category, list out name and price of premium
      .append('div')
      .style('color', d => {
        return comp.colors(d.key)
      })
      .style('font-size', 10)
      .html(d => {
        return `${d.key}: ${d.price}`
      })

    comp.tooltip
      .style("left",(mouseEvent.pageX + 20)+"px")
      .style("top",(mouseEvent.pageY + 20)+"px")
  }

}
