import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service.service';
import * as d3Legend from '../../assets/d3-svg-legend'
import * as d3 from 'd3';

const pinIconFull: string = "M 12 0 C 7.038 0 3 4.066 3 9.065 C 3 16.168 11.154 23.502 11.501 23.81 C 11.644 23.937 11.822 24 12 24 C 12.178 24 12.356 23.937 12.499 23.811 C 12.846 23.502 21 16.168 21 9.065 C 21 4.066 16.962 0 12 0 Z"

@Component({
  selector: 'app-data-viz2',
  templateUrl: './data-viz2.component.html',
  styleUrls: ['./data-viz2.component.scss']
})
export class DataViz2Component implements OnInit {

  showLog = true

  colors;
  container;

  margin = {top: 10, right: 30, bottom: 30, left: 60};
  width = 1000 - this.margin.left - this.margin.right;
  height = 600 - this.margin.top - this.margin.bottom;
  containerWidth = 1200;
  
  btcPrices = [];
  sp500 = []
  cherryPickDates = []
  data = [
    {type:'btc', values: []}, 
    {type:'sp', values: []}
  ]


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
      
      this.setupBaseGraph();
      this.displayGraph();
      this.drawLegend();
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
          const date = d3.timeParse("%Y-%m-%d")(spElement["Effective date"])          
          this.data[0]['values'].push([date, btcElement[1]])
          this.data[1]['values'].push([date, spElement["S&P 500"]])
        }
      });
    });
  }
  
  private setupBaseGraph(): void {
    this.container = d3.select('figure#graph2')
    .append('svg')
    .attr('class', 'container')
    .attr('width', this.containerWidth)
    .attr('height', this.height + 100)
  }

  private displayGraph(): void {
    this.display(this)
  }

  private display(comp: DataViz2Component): void {


    var svg = this.container
      .append("svg")
        .attr("class", "unit")
        .attr("width", this.width + this.margin.left + this.margin.right + 100)
        .attr("height", this.height + this.margin.top + this.margin.bottom + 50)
      .append("g")
      .attr('transform', `translate(${this.containerWidth/2 - this.width/2}, ${this.margin.left})`);

    const date: Date[] = []
    this.data[0].values.forEach(e => {
      date.push(e[0])
    })
    
    var xScale = d3.scaleTime()
      .domain(d3.extent(date))
      .range([ 0, this.width ]);
    svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(xScale));

    var y
    if (comp.showLog) {
      y = d3.scaleLog()
        .domain(
          [
            d3.min(comp.cherryPickDates, function(d) { return +d.btc_price; }),
            d3.max(comp.cherryPickDates, function(d) { return +d.btc_price; }) + 20000
          ])
        .range([ this.height, 0 ]);
    }
    else {
      y = d3.scaleLinear()
      .domain(
        [
          d3.min(comp.cherryPickDates, function(d) { return +d.btc_price; }),
          d3.max(comp.cherryPickDates, function(d) { return +d.btc_price; }) + 4000
        ])
      .range([ this.height, 0 ]);
    }

    svg.append("g")
      .call(d3.axisLeft(y)
        .tickFormat(y => {
          return `${comp.nFormatter(y, 0)}`
        }))
        
    comp.colors = d3.scaleOrdinal()
      .domain(this.data.map(d => d.type))
      .range(['#4862B4', '#ff5050'])

    var line = d3.line()
      .x(d => xScale(d[0]))
      .y(d => y(d[1]))

    var lineGroup = svg.append('g')
      .attr('class', 'lines2')
      .selectAll('.line-group2')
      .data(this.data).enter()
      .append('g')
      .attr('class', 'line')

    const path = lineGroup.append('path')
      .attr('id', d => d.type)
      .attr('d', d => line(d.values))
      .style('stroke', d => comp.colors(d.type))
      .style('stroke-width', 3)
      .style('fill', 'none')

    const pin = lineGroup.append('svg')
      .attr('x', xScale(new Date(2018, 11, 9)) - 10)
      .attr('y', '-25')
      .attr('width', 1000)
      .attr('height', 1000)
    pin.append('text')
      .text("Trade war")
      .attr('x', '25')
      .attr('y', '12')
      .attr('color', 'black')
    pin.append('text')
      .text("with China")
      .attr('x', '25')
      .attr('y', '32')
      .attr('color', 'black')
    pin.append('path')
      .attr('d', pinIconFull )
    pin.append('circle')
      .attr('cx', '12')
      .attr('cy', '9')
      .attr('r', '4')
      .attr('fill', 'white')

    const pin2 = lineGroup.append('svg')
      .attr('x', xScale(new Date(2020,2,8)) - 10)
      .attr('y', '-25')
      .attr('width', 1000)
      .attr('height', 1000)
    pin2.append('text')
      .text("Covid 19")
      .attr('x', '25')
      .attr('y', '17')
      .attr('color', 'black')
    pin2.append('path')
      .attr('d', pinIconFull )
    pin2.append('circle')
      .attr('cx', '12')
      .attr('cy', '9')
      .attr('r', '4')
      .attr('fill', 'white')
    
     var mouseGroup = svg.append('g')
       .attr('class', 'mouse-over-effects2')
  
     mouseGroup.append('path')
       .attr('class', 'mouse-line2')
       .style('stroke', '#A9A9A9')
       .style("stroke-width", 2)
       .style("opacity", "0");
  
     var mousePerLine = mouseGroup.selectAll('.mouse-per-line2')
       .data(this.data)
       .enter()
       .append("g")
       .attr("class", function(d) { return `mouse-per-line2-${d.type}`});

    mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", function(d) {
        return comp.colors(d.type);
      })
      .style("fill", "none")
      .style("stroke-width", "2px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(-50,-20)")
      .style("font-weight", "bold")
      .text("")

    mouseGroup.append('svg:rect')
      .attr('width', this.width) 
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () {
        d3.select(".mouse-line2")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line2-btc circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line2-sp circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line2-btc text")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line2-sp text")
          .style("opacity", "0");
      })
      .on('mouseover', function () {
        d3.select(".mouse-line2")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line2-btc circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line2-sp circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line2-btc text")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line2-sp text")
          .style("opacity", "1");
      })
      .on('mousemove', function (event: MouseEvent) {
        var mouse = d3.pointer(event)

         d3.selectAll(".mouse-per-line2-btc")
           .attr("transform", (d, i) => {
             
             var xDate = xScale.invert(mouse[0])             
             var bisect = d3.bisector(d => d[0]).left 
             var idx = bisect(d["values"], xDate);

             d3.select(".mouse-line2")
              .attr("d", function () {
                var data = "M" + xScale(d['values'][idx][0]) + "," + comp.height;
                data += " " + xScale(d['values'][idx][0]) + "," + 0;
                return data;
              });
  

            comp.displayTextMofo(mouse, comp, event, xScale, true);

            return "translate(" + xScale(d['values'][idx][0]) + "," + y(d['values'][idx][1]) + ")"
          });
          
          d3.selectAll(".mouse-per-line2-sp")
          .attr("transform", (d, i) => {
            
            const xDate = xScale.invert(mouse[0])             
            const bisect = d3.bisector(d => d[0]).left 
            const idx = bisect(d["values"], xDate);

            d3.select(".mouse-line2")
             .attr("d", function () {
               let data = "M" + xScale(d['values'][idx][0]) + "," + comp.height;
               data += " " + xScale(d['values'][idx][0]) + "," + 0;
               return data;
             });
 

           comp.displayTextMofo(mouse, comp, event, xScale, false);

           return "translate(" + xScale(d['values'][idx][0]) + "," + y(d['values'][idx][1]) + ")"
         });
      })
      
  }

  private displayTextMofo(mouse, comp: DataViz2Component, mouseEvent: MouseEvent, xScale, isBtc: boolean): void {
    const mouseValues = []
    comp.data.map(d => {
      const xDate = xScale.invert(mouse[0])             
      const bisect = d3.bisector(d => d[0]).left 
      const idx = bisect(d["values"], xDate);
      
      mouseValues.push({key: d.type, date: d.values[idx][0], price: d.values[idx][1]})
    })

    const positiveValue: string = String(true) as string;
    const negativeValue: string = String(false) as string;
    
    if (String(isBtc).toLowerCase().trim().valueOf() === String(positiveValue)) {
      d3.selectAll(".mouse-per-line2-btc text")
        .text(Math.ceil(mouseValues[0].price) + "$")
    }
    else if (String(isBtc).toLowerCase().trim().valueOf() === String(negativeValue)) {
      d3.selectAll(".mouse-per-line2-sp text")
      .text(Math.ceil(mouseValues[1].price) + "$")
    }
  }

  private drawLegend(): void {
    const scaleLeft = d3.scaleOrdinal()
    .domain(['Valeur du Bitcoin', 'Valeur du S&P500'])
    .range(['#4862B4', '#ff5050'])

    const legend = d3Legend.legendColor()
                           .title('Légende')
                           .shapeHeight(5)
                           .shapeWidth(20)
                           .shapePadding(5)
                           .labelWrap(150)
                           .scale(scaleLeft)
    this.container
      .append('g')
      .attr('class', 'legend')
      .attr('transform',  `translate(200, 100)`)
      .call(legend)
  }

  async getFolder(): Promise<string> {
    return this.http.get<any>(`assets/data/sp500.json`).toPromise();
  }

  onToggle(): void {    
    d3.selectAll('.unit').remove()
    this.displayGraph();
  }

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
