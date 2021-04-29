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

  showLog = true

  colors;
  
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
          const date = d3.timeParse("%Y-%m-%d")(spElement["Effective date"])          
          this.data[0]['values'].push([date, btcElement[1]])
          this.data[1]['values'].push([date, spElement["S&P 500"]])
        }
      });
    });
  }

  private displayGraph(): void {
    this.display(this)
  }

  private display(comp: DataViz2Component): void {
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#graph2")
      .append("svg")
        .attr("class", "unit")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis --> it is a date format
    const date: Date[] = []
    this.data[0].values.forEach(e => {
      date.push(e[0])
    })
    
    var xScale = d3.scaleTime()
      .domain(d3.extent(date))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    // Add Y axis
    var y
    if (comp.showLog) {
      y = d3.scaleLog()
        .domain([d3.min(comp.cherryPickDates, function(d) { return +d.btc_price; }), d3.max(comp.cherryPickDates, function(d) { return +d.btc_price; })])
        .range([ height, 0 ]);
    }
    else {
      y = d3.scaleLinear()
      .domain([d3.min(comp.cherryPickDates, function(d) { return +d.btc_price; }), d3.max(comp.cherryPickDates, function(d) { return +d.btc_price; })])
      .range([ height, 0 ]);
    }

    svg.append("g")
      .call(d3.axisLeft(y)
        .tickFormat(y => {
          return `${comp.nFormatter(y, 0)}`
        }))
      
      console.log(comp.cherryPickDates)
    // Add the line

    comp.colors = d3.scaleOrdinal()
      .domain(this.data.map(d => d.type))
      .range(['#4862B4', '#A6D3A6'])

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
      .style('stroke-weight', 1.5)
      .style('fill', 'none')

    
     var mouseGroup = svg.append('g')
       .attr('class', 'mouse-over-effects2')
  
     mouseGroup.append('path')
       .attr('class', 'mouse-line2')
       .style('stroke', '#A9A9A9')
       .style("stroke-width", 2)
       .style("opacity", "0");
  
     var lines = document.getElementsByClassName('line') as any;

     var mousePerLine = mouseGroup.selectAll('.mouse-per-line2')
       .data(this.data)
       .enter()
       .append("g")
       .attr("class", "mouse-per-line2");

    mousePerLine.append("circle")
      .attr("r", 5)
      .style("stroke", function(d) {
        return comp.colors(d.type);
      })
      .style("fill", "none")
      .style("stroke-width", "2px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)")
      .text("TEST")

    mouseGroup.append('svg:rect')
      .attr('width', width) 
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () { // on mouse out hide line, circles and text
         d3.select(".mouse-line2")
           .style("opacity", "0");
         d3.selectAll(".mouse-per-line2 circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line2 text")
          .style("opacity", "0");

      })
      .on('mouseover', function () { // on mouse in show line, circles and text
        d3.select(".mouse-line2")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line2 circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line2 text")
          .style("opacity", "1");
      })
      .on('mousemove', function (event: MouseEvent) { // update tooltip content, line, circles and text when mouse moves
        var mouse = d3.pointer(event)

         d3.selectAll(".mouse-per-line2")
           .attr("transform", (d, i) => {
             
             var xDate = xScale.invert(mouse[0])             
             var bisect = d3.bisector(d => d[0]).left 
             var idx = bisect(d["values"], xDate);

             d3.select(".mouse-line2")
              .attr("d", function () {
                var data = "M" + xScale(d['values'][idx][0]) + "," + height;
                data += " " + xScale(d['values'][idx][0]) + "," + 0;
                return data;
              });
            console.log(d);

            // var beginning = 0,
            //     end = lines[i].getTotalLength(),
            //     target = null;
            
            //     let pos
            // while (true){
            //   target = Math.floor((beginning + end) / 2);
            //   pos = lines[i].getPointAtLength(target);
            //   if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            //       break;
            //   }
            //   if (pos.x > mouse[0])      end = target;
            //   else if (pos.x < mouse[0]) beginning = target;
            //   else break; //position found
            // }
            
            // d3.select(this).select('text')
            //   .text(y.invert(pos.y).toFixed(2));

            return "translate(" + xScale(d['values'][idx][0]) + "," + y(d['values'][idx][1]) + ")"
          });
      })
      
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
