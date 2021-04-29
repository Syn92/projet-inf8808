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
    var x = d3.scaleTime()
      .domain(d3.extent(comp.cherryPickDates, function(d) { return d3.timeParse("%Y-%m-%d")(d.date); }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

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
      
    // Add the line
    svg.append("path")
      .datum(comp.cherryPickDates)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function(d: any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
        .y(function(d: any) { return y(d.btc_price) })
        )
    svg.append("path")
      .datum(comp.cherryPickDates)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .curve(d3.curveBasis)
        .x(function(d: any) { return x(d3.timeParse("%Y-%m-%d")(d.date)) })
        .y(function(d: any) { return y(d.sp_price) })
        )

    var lines = document.getElementsByClassName('line');

    svg.append("rect")
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function(event: MouseEvent) { // mouse moving over canvas
        var mouse = d3.pointer(event);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        // d3.selectAll(".mouse-per-line")
        //   .attr("transform", function(d, i) {
        //     console.log(width/mouse[0])
        //     var xDate = x.invert(mouse[0]),
        //         bisect = d3.bisector(function(d) { return d.date; }).right;
            
        //     var beginning = 0,
        //         end = lines[i].getTotalLength(),
        //         target = null;

        //     while (true){
        //       target = Math.floor((beginning + end) / 2);
        //       pos = lines[i].getPointAtLength(target);
        //       if ((target === end || target === beginning) && pos.x !== mouse[0]) {
        //           break;
        //       }
        //       if (pos.x > mouse[0])      end = target;
        //       else if (pos.x < mouse[0]) beginning = target;
        //       else break; //position found
        //     }
            
        //     d3.select(this).select('text')
        //       .text(y.invert(pos.y).toFixed(2));
              
        //     return "translate(" + mouse[0] + "," + pos.y +")";
        //   });
      });
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
