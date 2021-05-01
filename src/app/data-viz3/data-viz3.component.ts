  import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';  
import { IData } from '../../assets/Interfaces';
import * as d3Legend from '../../assets/d3-svg-legend'
import * as d3 from 'd3';
import {nest} from 'd3-collection'

const pinIcon: string = "m12 0c-4.962 0-9 4.066-9 9.065 0 7.103 8.154 14.437 8.501 14.745.143.127.321.19.499.19s.356-.063.499-.189c.347-.309 8.501-7.643 8.501-14.746 0-4.999-4.038-9.065-9-9.065zm0 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"
const pinIconFull: string = "M 12 0 C 7.038 0 3 4.066 3 9.065 C 3 16.168 11.154 23.502 11.501 23.81 C 11.644 23.937 11.822 24 12 24 C 12.178 24 12.356 23.937 12.499 23.811 C 12.846 23.502 21 16.168 21 9.065 C 21 4.066 16.962 0 12 0 Z"
@Component({
  selector: 'app-data-viz3',
  templateUrl: './data-viz3.component.html',
  styleUrls: ['./data-viz3.component.scss']
})
export class DataViz3Component implements OnInit {

  private readonly RIGHT_AXIS = ['btcDom', 'trend']
  private readonly LEFT_AXIS = ['global', 'volume', 'btcPrice']
  
  private data: any;
  private pinTooltip: any
  private rectTooltip: any
  public  graphTooltip: any;
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
    this.displayLines(this)
    this.drawCycle()
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

  private drawCycle() {
    const self = this
    const cycles = [
      {
        type: 'bull',
        tooltipText: "Premiers stades du bitcoin",
        start: new Date(2013, 11, 31),
        end: new Date(2014, 5, 9),
        description: "De sa creation en 2011, jusqu'à Juin 2014, le prix d'un bitcoin grimpe de 12000% à la hausse, passant de quelques dollars a 1100$",
      },
      {
        type: 'bear',
        tooltipText: "Le marché devient baissier avec un bitcoin ayant atteint les 1 150$",
        start: new Date(2014, 5, 10),
        end: new Date(2016, 6, 8),
        description: 'Lors de ces 759 jours, le bitcoin atteint une perte de valeur de -80% passant de 1100 a 200',
      },
      {
        type: 'bull',
        tooltipText: "Le marché est haussier et le mouvement est amplifié par le halving du bitcoin" ,
        start: new Date(2016, 6, 9),
        end: new Date(2018, 0, 10),
        description: "Lors de ces 550 jours, le bitcoin enregistre une hausse de 9000% passant d'environ 200$ a 18 000$",
      },
      {
        type: 'bear',
        tooltipText: "Le marché redevient baissier après avoir été en zone de surévaluation, avec un Bitcoin ayant atteint les 17 000$",
        start: new Date(2018, 0, 11),
        end: new Date(2020, 4, 10),
        description: "Lors de ces 851 jours, le prix du bitcoin decend jusqu'a une perte de -73% de sa valeur, passant de plus de 18 000$ à un peu moins de 4000$",
      },
      {
        type: 'bull',
        tooltipText: "Un nouveau halving du bitcoin, indicateur d'un nouveau cycle haussier, propulse le marché à la hausse",
        start: new Date(2020, 4, 11),
        end: new Date(2021, 3, 7),
        description: "En 380 jours, le bitcoin a deja fait plus de x10 dans ce cylce (1000%), passant d'un plus bas à 4000$ à un plus haut de 65 000$",
      }
    ]

    this.pinTooltip = d3.select("#graph").append('div')
      .attr('class', 'pinTooltip')
      .style('position', 'absolute')
      .style('display', 'none')
      .text('tooltip text')
      

    this.rectTooltip = d3.select("#graph").append('div')
    .attr('class', 'rectTooltip')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('height', '100px')
    
    const te = this.svg.selectAll('.cycle')
      .data(cycles)
      .enter().append('g')
      .attr('class', 'cycle')
      
      const rect = te.append('rect')
      .attr('x', d => this.xScale(d.start))
      .attr('y', 0)
      .attr('width', d => this.xScale(d.end) - this.xScale(d.start))
      .attr('height', 18)
      .attr('class', 'rect')
      .style('cursor', 'pointer')
      .style('fill', d => {
        return d.type == 'bear' ? 'indianred' : 'mediumspringgreen'
      })
      .on('mouseenter', (event, d) => {
        self.rectTooltip
        .style('display', 'block')
        .style('left', (event.path[0].getBoundingClientRect().x) - ((self.xScale(d.end) - self.xScale(d.start)) < 140 ? 100 : 0) + "px")
        .style('top', Math.floor(event.pageY)-120 + "px")
        .style('width', ((self.xScale(d.end) - self.xScale(d.start)) < 140 ? 140 : (self.xScale(d.end) - self.xScale(d.start)) + 'px'))
        .html('<span>' + d.description + '</span>')
      })
      .on('mouseleave', () => {
        self.rectTooltip
        .style('display', 'none')
      })
      
      te.append('text')
      .attr('x', d => this.xScale(d.start) + ((this.xScale(d.end)- this.xScale(d.start))/2))
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.type)

      const pin = te.append('svg')
        .attr('x', d => this.xScale(d.start)- 10)
        .attr('y', '-25')
        .style('cursor', 'pointer')
        pin.on('mouseenter', (event, d) => {
          // hover
          self.pinTooltip
          .style('display', 'block')
          .style('left', (event.path[0].getBoundingClientRect().x - 90) + "px")
          .style('top', Math.floor(event.pageY)-100 + "px")
          .html(`<span class="pinTooltipTextTitle">  ${d.start.getDate()}-${d.start.getMonth() + 1}-${d.start.getFullYear()} <br> </span>` + '<span class="pinTooltipText">' + d.tooltipText + '</span>')
          .style('width', '200px')

          
        })
        pin.on('mouseleave', () => {
          self.pinTooltip.style('display', 'none')
        })

      pin.append('path')
      .attr('d', pinIconFull )
      pin.append('circle')
      .attr('cx', '12')
      .attr('cy', '9')
      .attr('r', '4')
      .attr('fill', 'white')
      
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
    if (typeof obj == 'string' || obj instanceof String){
      d3.select(`#${obj}`)
      // .attr('stroke-dashoffset',(d,i,e) => {return show ? e.length : 0})
      // .attr("stroke-dasharray", (d,i,e) => {return show ? e.length : 0})

      .style("visibility", show ? "visible" : "hidden")
    } else
      obj.style("visibility", show ? "visible" : "hidden")
  }

  private displayLines(comp: DataViz3Component) {
    comp.colors = d3.scaleOrdinal()
      .domain(this.LEFT_AXIS.concat(this.RIGHT_AXIS))
      .range(['#4682B4', '#A6D3A6', '#4B0082', '#FFA500', '#FF1493'])

    var lineLeft = d3.line()
      .x(d => this.xScale(d[0]))
      .y(d => this.yScale1(d[1]))

    var lineRight = d3.line()
      .x(d => this.xScale(d[0]))
      .y(d => this.yScale2(d[1]))

    var lineGroup = this.svg.append('g')
      .attr('class', 'lines')
      .selectAll('.line-group')
      .data(this.data.filter((d) => d.type != 'volume')).enter()
      .append('g')
      .attr('class', 'line')
      

    const path = lineGroup.append('path')
      .attr('id', d => d.type)
      .attr('d', d => {
        return this.LEFT_AXIS.includes(d.type) ? lineLeft(d.values) : lineRight(d.values)
      })
      .style('stroke', (d) => comp.colors(d.type))
      .style('stroke-weight', 1.5)
      .style('fill', 'none')
      .attr("stroke-dashoffset", (d, i, e) => e[i].getTotalLength())
      .attr("stroke-dasharray", (d, i, e) => e[i].getTotalLength())
      .transition(d3
        .transition()
        .ease(d3.easeSin)
        .duration(2000))
      .attr("stroke-dashoffset", 0);

    comp.graphTooltip = d3.select("#graph").append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'rgb(230, 230, 230)')
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

            if (d['type'] == 'volume' || d['type'] == "trend")
              return ''

            var xDate = comp.xScale.invert(mouse[0])
            var bisect = d3.bisector(d => d[0]).left 
            var idx = bisect(d["values"], xDate);

            d3.select(".mouse-line")
              .attr("d", function () {
                var data = "M" + comp.xScale(d['values'][idx][0]) + "," + 500;
                data += " " + comp.xScale(d['values'][idx][0]) + "," + 0;
                return data;
              });
          });

        comp.updateTooltip(mouse, comp.data, comp, event)

      })
  }

  private updateTooltip(mouse, data, comp: DataViz3Component, mouseEvent: MouseEvent) {

    var mouseValues = []
    data.map(d => {
      var xDate = comp.xScale.invert(mouse[0])
      var bisect = d3.bisector(d => d[0]).left

      if (d['type'] == 'volume'){
        var idx = bisect(d.values.average, xDate)
        mouseValues.push({key: d.type, date: d.values.average[idx][0], price: d.values.average[idx][1]})
      } else {
        var idx = bisect(d.values, xDate)
        mouseValues.push({key: d.type, date: d.values[idx][0], price: d.values[idx][1]})
      }
    })

    comp.graphTooltip.html(`<span id="title">Date: ${mouseValues[0].date.getDate()}-${mouseValues[0].date.getMonth() + 1}-${mouseValues[0].date.getFullYear()}</span>`)
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
        return `${d.key}: ${Math.floor(d.price).toLocaleString()} ${d.key == 'trend' ? '' : (d.key == 'btcDom' ? '%' : '$')}`
      })

    comp.graphTooltip
      .style("left",(mouseEvent.pageX + 20)+"px")
      .style("top",(mouseEvent.pageY + 20)+"px")
  }

}
